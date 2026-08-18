import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { SettingsService } from './settings.service';

export interface CapiCustomerData {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  commune?: string | null;
  wilaya?: string | null;
  country?: string | null;
}

export interface CapiOrderItem {
  id: string;
  quantity: number;
  price: number;
}

export interface CapiEventParams {
  eventName?: string;
  orderId: string;
  eventId?: string;
  total: number;
  currency?: string;
  customer: CapiCustomerData;
  items: CapiOrderItem[];
  clientIp?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  eventSourceUrl?: string | null;
  actionSource?: 'website' | 'system' | 'other';
}

export type CapiPurchaseEventParams = CapiEventParams;

@Injectable()
export class MetaCapiService {
  private readonly logger = new Logger(MetaCapiService.name);
  private readonly graphApiVersion = 'v21.0';

  constructor(private readonly settingsService: SettingsService) { }


  //Helper to hash a normalized string using SHA-256
  //Rules: Strictly lowercase all strings and remove leading/trailing whitespace.

  private hashSha256(value?: string | null): string | null {
    if (!value || typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }


  //Normalize and hash phone numbers according to Meta & E.164 requirements.
  //Algeria format: e.g. "0555123456", "0777123456", "+213555123456" -> "213555123456" -> SHA-256

  private hashPhone(phone?: string | null): string | null {
    if (!phone || typeof phone !== 'string') return null;

    // 1. Extract only digits
    let digits = phone.replace(/\D/g, '');
    if (!digits) return null;

    // 2. Remove leading international double-zero if present
    if (digits.startsWith('00')) {
      digits = digits.substring(2);
    }

    // 3. Normalize Algerian phone patterns
    let matchedPattern = false;
    if (digits.startsWith('2130') && digits.length === 13) {
      // e.g., 2130555123456 -> 213555123456
      digits = '213' + digits.substring(4);
      matchedPattern = true;
    } else if (digits.startsWith('213') && (digits.length === 11 || digits.length === 12)) {
      // Already formatted with 213 country code (e.g. 213555123456 or 21321123456)
      matchedPattern = true;
    } else if (digits.startsWith('0') && digits.length === 10) {
      // Local 10-digit format (05xx, 06xx, 07xx, 02xx...) -> 2135xx...
      digits = '213' + digits.substring(1);
      matchedPattern = true;
    } else if (!digits.startsWith('213') && digits.length === 9) {
      // 9-digit without leading 0 -> prepend 213
      digits = '213' + digits;
      matchedPattern = true;
    }

    if (!matchedPattern) {
      // Fallback branch: non-Algerian or unnormalized pattern.
      // Log without PII (digit count only, never raw phone digits) to monitor match rate degradation.
      this.logger.debug(
        `[CAPI] Phone normalization fallback: number did not match standard Algerian E.164 patterns (digit count: ${digits.length}). Hashing raw digits.`,
      );
    }

    // 4. Return SHA-256 hash of normalized/raw E.164 digits
    return crypto.createHash('sha256').update(digits).digest('hex');
  }

  //Core method to dispatch any Conversions API event to Meta Graph API
  async sendEvent(params: CapiEventParams): Promise<boolean> {
    const eventName = params.eventName || 'Purchase';
    const canonicalEventId = params.eventId || params.orderId;

    try {
      const config = await this.settingsService.getInternalMetaCapiConfig();

      if (!config.capiEnabled) {
        this.logger.debug(
          `[CAPI] Server-side tracking disabled in settings. Skipping ${eventName} for order ${params.orderId}.`,
        );
        return false;
      }

      if (!config.pixelId || !config.capiToken) {
        this.logger.warn(
          `[CAPI] Missing Pixel ID or CAPI Access Token. Skipping ${eventName} for order ${params.orderId}.`,
        );
        return false;
      }

      const eventTime = Math.floor(Date.now() / 1000);
      const currency = params.currency || 'DZD';

      // Build User Data with SHA-256 hashed guest customer PII
      const userData: Record<string, any> = {};

      const hashedPhone = this.hashPhone(params.customer.phone);
      if (hashedPhone) userData.ph = [hashedPhone];

      const hashedFirstName = this.hashSha256(params.customer.firstName);
      if (hashedFirstName) userData.fn = [hashedFirstName];

      const hashedLastName = this.hashSha256(params.customer.lastName);
      if (hashedLastName) userData.ln = [hashedLastName];

      const hashedEmail = this.hashSha256(params.customer.email);
      if (hashedEmail) userData.em = [hashedEmail];

      const hashedCommune = this.hashSha256(params.customer.commune);
      if (hashedCommune) userData.ct = [hashedCommune];

      const hashedWilaya = this.hashSha256(params.customer.wilaya);
      if (hashedWilaya) userData.st = [hashedWilaya];

      // Default country code: 'dz'
      const hashedCountry = this.hashSha256(params.customer.country || 'dz');
      if (hashedCountry) userData.country = [hashedCountry];

      // Raw unhashed client metadata
      if (params.clientIp) userData.client_ip_address = params.clientIp;
      if (params.clientUserAgent) userData.client_user_agent = params.clientUserAgent;
      if (params.fbp) userData.fbp = params.fbp;
      if (params.fbc) userData.fbc = params.fbc;

      // Build Custom Data (items, total, order ID)
      const contents = (params.items || []).map((item) => ({
        id: String(item.id),
        quantity: item.quantity,
        item_price: Number(item.price),
      }));

      const numItems = (params.items || []).reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const eventPayload: Record<string, any> = {
        event_name: eventName,
        event_time: eventTime,
        event_id: canonicalEventId, // Canonical ID for deduplication
        event_source_url:
          params.eventSourceUrl || 'https://bendouha.com/checkout',
        action_source: params.actionSource || 'website',
        user_data: userData,
        custom_data: {
          currency,
          value: Number(params.total),
          content_type: 'product',
          contents,
          num_items: numItems || 1,
          order_id: params.orderId,
          status: eventName === 'Order_Delivered' ? 'delivered' : undefined,
        },
      };

      const requestBody: Record<string, any> = {
        data: [eventPayload],
        access_token: config.capiToken,
      };

      if (config.testEventCode) {
        requestBody.test_event_code = config.testEventCode;
      }

      const url = `https://graph.facebook.com/${this.graphApiVersion}/${config.pixelId}/events`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // SECURITY: Never log plain-text customer PII in console/logs
        this.logger.error(
          `[CAPI] Meta Graph API returned error for event ${eventName} (order ${params.orderId}): ${JSON.stringify(responseData)}`,
        );
        return false;
      }

      this.logger.log(
        `[CAPI] Successfully sent ${eventName} event for order ${params.orderId} (event_id: ${canonicalEventId}, events_received: ${responseData.events_received ?? 1})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `[CAPI] Exception occurred while sending ${eventName} event for order ${params.orderId}: ${error?.message || error}`,
      );
      return false;
    }
  }

  //Dispatch a Purchase event to Meta Conversions API (Online Checkout)
  async sendPurchaseEvent(params: CapiPurchaseEventParams): Promise<boolean> {
    return this.sendEvent({
      ...params,
      eventName: 'Purchase',
      eventId: params.orderId, // Shared with client-side fbq('track', 'Purchase', ..., { eventID: order.id })
      actionSource: 'website',
    });
  }

  //Dispatch an Order_Delivered (COD Offline Conversion) event to Meta Conversions API
  //Trains Meta's ad algorithm on customers who completed payment on delivery.
  async sendOrderDeliveredEvent(params: CapiPurchaseEventParams): Promise<boolean> {
    return this.sendEvent({
      ...params,
      eventName: 'Order_Delivered',
      eventId: `${params.orderId}_delivered`,
      actionSource: 'system',
    });
  }
}
