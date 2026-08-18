import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMetaPixelDto } from './dto/update-meta-pixel.dto';

const DEFAULT_SETTINGS_ID = 'default';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve full Meta Pixel & CAPI settings for the protected Admin Dashboard
   */
  async getMetaPixelSettings() {
    const settings = await this.prisma.app_settings.findUnique({
      where: { id: DEFAULT_SETTINGS_ID },
    });

    return {
      metaPixelId: settings?.meta_pixel_id ?? null,
      metaPixelEnabled: settings?.meta_pixel_enabled ?? false,
      metaCapiToken: settings?.meta_capi_token ?? null,
      metaCapiEnabled: settings?.meta_capi_enabled ?? false,
      metaTestEventCode: settings?.meta_test_event_code ?? null,
      updatedAt: settings?.updated_at ?? null,
    };
  }

  /**
   * Update Meta Pixel & CAPI settings from the Admin Dashboard
   */
  async updateMetaPixelSettings(dto: UpdateMetaPixelDto, adminId?: string) {
    // Resolve camelCase or snake_case inputs
    const pixelId =
      dto.metaPixelId !== undefined
        ? dto.metaPixelId
        : dto.meta_pixel_id !== undefined
          ? dto.meta_pixel_id
          : undefined;

    const pixelEnabled =
      dto.metaPixelEnabled !== undefined
        ? dto.metaPixelEnabled
        : dto.meta_pixel_enabled !== undefined
          ? dto.meta_pixel_enabled
          : undefined;

    const capiToken =
      dto.metaCapiToken !== undefined
        ? dto.metaCapiToken
        : dto.meta_capi_token !== undefined
          ? dto.meta_capi_token
          : undefined;

    const capiEnabled =
      dto.metaCapiEnabled !== undefined
        ? dto.metaCapiEnabled
        : dto.meta_capi_enabled !== undefined
          ? dto.meta_capi_enabled
          : undefined;

    const testEventCode =
      dto.metaTestEventCode !== undefined
        ? dto.metaTestEventCode
        : dto.meta_test_event_code !== undefined
          ? dto.meta_test_event_code
          : undefined;

    let sanitizedPixelId: string | null | undefined = undefined;
    if (pixelId !== undefined) {
      if (pixelId === null) {
        sanitizedPixelId = null;
      } else if (typeof pixelId === 'string') {
        const trimmed = pixelId.trim();
        if (!trimmed) {
          sanitizedPixelId = null;
        } else if (/^\d{10,20}$/.test(trimmed)) {
          sanitizedPixelId = trimmed;
        } else {
          this.logger.warn(
            `[SettingsService] Rejected non-numeric or invalid length Meta Pixel ID. Storing null instead.`,
          );
          sanitizedPixelId = null;
        }
      } else {
        sanitizedPixelId = null;
      }
    }

    const sanitizedCapiToken =
      capiToken !== undefined
        ? typeof capiToken === 'string'
          ? capiToken.trim() || null
          : null
        : undefined;

    const sanitizedTestEventCode =
      testEventCode !== undefined
        ? typeof testEventCode === 'string'
          ? testEventCode.trim() || null
          : null
        : undefined;

    const dataToUpdate: {
      meta_pixel_id?: string | null;
      meta_pixel_enabled?: boolean;
      meta_capi_token?: string | null;
      meta_capi_enabled?: boolean;
      meta_test_event_code?: string | null;
      updated_by?: string;
    } = {};

    if (sanitizedPixelId !== undefined) {
      dataToUpdate.meta_pixel_id = sanitizedPixelId;
    }

    if (pixelEnabled !== undefined) {
      dataToUpdate.meta_pixel_enabled = Boolean(pixelEnabled);
    }

    if (sanitizedCapiToken !== undefined) {
      dataToUpdate.meta_capi_token = sanitizedCapiToken;
    }

    if (capiEnabled !== undefined) {
      dataToUpdate.meta_capi_enabled = Boolean(capiEnabled);
    }

    if (sanitizedTestEventCode !== undefined) {
      dataToUpdate.meta_test_event_code = sanitizedTestEventCode;
    }

    if (adminId) {
      dataToUpdate.updated_by = adminId;
    }

    const updated = await this.prisma.app_settings.upsert({
      where: { id: DEFAULT_SETTINGS_ID },
      create: {
        id: DEFAULT_SETTINGS_ID,
        meta_pixel_id: sanitizedPixelId ?? null,
        meta_pixel_enabled: pixelEnabled ?? false,
        meta_capi_token: sanitizedCapiToken ?? null,
        meta_capi_enabled: capiEnabled ?? false,
        meta_test_event_code: sanitizedTestEventCode ?? null,
        updated_by: adminId,
      },
      update: dataToUpdate,
    });

    this.logger.log(
      `Meta settings updated by admin ${adminId ?? 'system'}: Pixel=${updated.meta_pixel_enabled} (${updated.meta_pixel_id || 'none'}), CAPI=${updated.meta_capi_enabled} (Token=${updated.meta_capi_token ? 'configured' : 'none'}, TestCode=${updated.meta_test_event_code || 'none'})`,
    );

    return {
      metaPixelId: updated.meta_pixel_id,
      metaPixelEnabled: updated.meta_pixel_enabled,
      metaCapiToken: updated.meta_capi_token,
      metaCapiEnabled: updated.meta_capi_enabled,
      metaTestEventCode: updated.meta_test_event_code,
      updatedAt: updated.updated_at,
    };
  }

  /**
   * Retrieve public Meta Pixel settings for frontend tracking script.
   * SECURITY: Strictly limited to public client fields. NEVER exposes CAPI tokens.
   */
  async getPublicMetaPixel() {
    const settings = await this.prisma.app_settings.findUnique({
      where: { id: DEFAULT_SETTINGS_ID },
      select: {
        meta_pixel_id: true,
        meta_pixel_enabled: true,
      },
    });

    return {
      metaPixelId: settings?.meta_pixel_id ?? null,
      metaPixelEnabled: settings?.meta_pixel_enabled ?? false,
    };
  }

  /**
   * Internal helper for Backend services (e.g., CAPI dispatching in OrdersService)
   */
  async getInternalMetaCapiConfig() {
    const settings = await this.prisma.app_settings.findUnique({
      where: { id: DEFAULT_SETTINGS_ID },
      select: {
        meta_pixel_id: true,
        meta_capi_token: true,
        meta_capi_enabled: true,
        meta_test_event_code: true,
      },
    });

    return {
      pixelId: settings?.meta_pixel_id ?? null,
      capiToken: settings?.meta_capi_token ?? null,
      capiEnabled: settings?.meta_capi_enabled ?? false,
      testEventCode: settings?.meta_test_event_code ?? null,
    };
  }
}
