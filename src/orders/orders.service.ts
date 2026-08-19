import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminAction, AdminEntity, Prisma } from '@prisma/client';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { MetaCapiService } from '../settings/meta-capi.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
    private readonly metaCapiService: MetaCapiService,
  ) { }

  async create(card_id: string, dto: CreateOrderDto, req?: any) {
    if (!card_id) {
      throw new BadRequestException('cart_id is required');
    }

    const cart = await this.prisma.cards.findUnique({
      where: { id: card_id },
      include: {
        card_items: {
          include: { products: true },
        },
      },
    });

    if (!cart || cart.card_items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const zone = await this.prisma.shipping_zones.findUnique({
      where: { id: dto.wilaya_id },
      include: {
        shipping_rates: { orderBy: { min_value: 'asc' } },
      },
    });

    if (!zone || zone.active === false) {
      throw new BadRequestException('Wilaya not found');
    }

    const commune = await this.prisma.shipping_communes.findFirst({
      where: {
        id: dto.commune_id,
        shipping_zone_id: dto.wilaya_id,
      },
    });

    if (!commune || commune.active === false) {
      throw new BadRequestException(
        'Commune not found for the selected wilaya',
      );
    }

    const pendingStatus = await this.prisma.order_statuses.findFirst({
      where: {
        status_name: {
          equals: 'Pending',
          mode: 'insensitive',
        },
      },
    });

    if (!pendingStatus) {
      throw new BadRequestException('Pending status not configured');
    }

    const deliveryType = dto.delivery_type ?? 'home';

    let shippingPrice = 0;

    if (deliveryType === 'office') {
      if (!commune.office_delivery_enabled) {
        throw new BadRequestException('Office delivery not available');
      }
      shippingPrice = commune.free_shipping
        ? 0
        : Number(commune.office_delivery_price ?? 0);
    } else {
      if (!commune.home_delivery_enabled) {
        throw new BadRequestException('Home delivery not available');
      }
      shippingPrice = commune.free_shipping
        ? 0
        : Number(commune.home_delivery_price ?? 0);
    }

    const itemsTotal = cart.card_items.reduce((sum, item) => {
      const unitPrice = Number(item.products?.sale_price ?? 0);
      const qty = item.quantity ?? 1;
      return sum + unitPrice * qty;
    }, 0);

    const totalPrice = itemsTotal + shippingPrice;

    // Generate high-entropy, cryptographically secure random order ID (128 bits of entropy)
    // Format: ORD-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (36 chars), completely unguessable to prevent enumeration.
    const orderId = `ORD-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

    const order = await this.prisma.orders.create({
      data: {
        id: orderId,
        customer_id: dto.customer_id,
        coupon_id: dto.coupon_id,
        order_status_id: pendingStatus.id,
        customer_first_name: dto.customer_first_name,
        customer_last_name: dto.customer_last_name,
        customer_phone: dto.customer_phone,
        customer_wilaya: zone.display_name,
        customer_commune: commune.display_name,
        delivery_type: deliveryType,
        shipping_zone_id: zone.id,
        shipping_commune_id: commune.id,
        shipping_price: new Prisma.Decimal(shippingPrice),
        total_price: new Prisma.Decimal(totalPrice),
        order_items: {
          create: cart.card_items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity ?? 1,
            price: new Prisma.Decimal(item.products?.sale_price ?? 0),
            color: item.color,
            dimension: item.dimension,
          })),
        },
      },
      include: {
        order_items: {
          include: { products: true },
        },
        customers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        order_statuses: true,
        shipping_zones: true,
        shipping_communes: true,
      },
    });

    await this.prisma.card_items.deleteMany({
      where: { card_id },
    });

    // -------------------------------------------------------------
    // Asynchronous Meta Conversions API (CAPI) Purchase Dispatch
    // -------------------------------------------------------------
    // SECURITY: Derive client IP from trusted proxy header or socket, not untrusted client body
    const rawForwardedFor = req?.headers?.['x-forwarded-for'];
    const forwardedIp =
      typeof rawForwardedFor === 'string'
        ? rawForwardedFor.split(',')[0].trim()
        : Array.isArray(rawForwardedFor)
          ? rawForwardedFor[0]?.trim()
          : null;

    const clientIp =
      forwardedIp || req?.ip || req?.socket?.remoteAddress || null;

    const clientUserAgent =
      (typeof req?.headers?.['user-agent'] === 'string'
        ? req.headers['user-agent']
        : null) ||
      dto.client_user_agent ||
      null;

    this.metaCapiService
      .sendPurchaseEvent({
        orderId: order.id,
        total: totalPrice,
        currency: 'DZD',
        customer: {
          firstName: dto.customer_first_name,
          lastName: dto.customer_last_name,
          phone: dto.customer_phone,
          commune: commune.display_name,
          wilaya: zone.display_name,
          country: 'dz',
        },
        items: cart.card_items.map((item) => ({
          id: item.product_id || item.id,
          quantity: item.quantity ?? 1,
          price: Number(item.products?.sale_price ?? 0),
        })),
        clientIp,
        clientUserAgent,
        fbp: dto.fbp || null,
        fbc: dto.fbc || null,
        eventSourceUrl: dto.event_source_url || null,
      })
      .catch((capiErr) => {
        this.logger.error(
          `[CAPI] Background Purchase dispatch error for order ${order.id}: ${capiErr?.message || capiErr}`,
        );
      });

    return {
      message: 'Order created successfully',
      data: order,
      pricing: {
        items_total: itemsTotal,
        shipping: shippingPrice,
        total: totalPrice,
      },
    };
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimitRaw =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
    const safeLimit = Math.min(50, safeLimitRaw);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      this.prisma.orders.findMany({
        skip,
        take: safeLimit,
        include: {
          order_items: { include: { products: true } },
          customers: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          order_statuses: true,
          shipping_zones: true,
          shipping_communes: true,
          coupons: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.orders.count(),
    ]);

    return {
      data: items,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: string, phone?: string) {
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      throw new BadRequestException(
        'Phone number verification is required to look up order details',
      );
    }

    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: {
          include: { products: true },
        },
        customers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        order_statuses: {
          select: {
            id: true,
            status_name: true,
            color: true,
          },
        },
        shipping_zones: true,
        shipping_communes: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Mandatory 2-factor phone verification
    const normalizedQueryPhone = phone.replace(/\D/g, '');
    const normalizedOrderPhone = (order.customer_phone || '').replace(/\D/g, '');

    const isMatch =
      Boolean(normalizedQueryPhone) &&
      Boolean(normalizedOrderPhone) &&
      (normalizedOrderPhone.endsWith(normalizedQueryPhone) ||
        normalizedQueryPhone.endsWith(normalizedOrderPhone));

    if (!isMatch) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order details',
      data: order,
    };
  }

  async update(id: string, dto: UpdateOrderDto, adminId: string) {
    const existing = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: { include: { products: true } },
        order_statuses: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.orders.update({
      where: { id },
      data: {
        order_status_id: dto.order_status_id,
        updated_by: adminId,
      },
      include: {
        order_statuses: true,
        order_items: { include: { products: true } },
      },
    });

    const oldStatus = existing.order_statuses?.status_name || 'UNKNOWN';
    const newStatus = order.order_statuses?.status_name || 'UPDATED';
    const isConfirmAction =
      newStatus.toLowerCase().includes('confirm') ||
      newStatus.toLowerCase().includes('approv') ||
      newStatus.toLowerCase().includes('valid');

    const customerFullName =
      `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() ||
      'Client';

    const orderItemsSummary = (order.order_items || []).map((item) => ({
      product_id: item.product_id || item.id,
      product_name: item.products?.product_name || 'Produit',
      quantity: item.quantity ?? 1,
      price: Number(item.price || item.products?.sale_price || 0),
    }));

    await this.adminsLogsService.log({
      adminId,
      action: isConfirmAction ? AdminAction.CONFIRM : AdminAction.UPDATE,
      entity: AdminEntity.ORDER,
      entityId: id,
      description: isConfirmAction
        ? `Confirmed order #${id} for ${customerFullName} (${order.order_items?.length || 0} item(s) - ${order.total_price || 0} DZD)`
        : `Updated order #${id} status: ${oldStatus} -> ${newStatus}`,
      metadata: {
        order_id: id,
        customer_name: customerFullName,
        customer_phone: order.customer_phone,
        customer_wilaya: order.customer_wilaya,
        customer_commune: order.customer_commune,
        previous_status: oldStatus,
        new_status: newStatus,
        total_price: Number(order.total_price || 0),
        items_count: order.order_items?.length || 0,
        items: orderItemsSummary,
      },
    });

    // COD Offline Conversion: If new status is DELIVERED, fire CAPI
    const statusName = (order.order_statuses?.status_name || '').trim().toLowerCase();
    const isDelivered =
      statusName.includes('deliver') ||
      statusName.includes('livr') ||
      statusName.includes('complete') ||
      statusName === 'delivered';

    if (isDelivered) {
      this.metaCapiService
        .sendOrderDeliveredEvent({
          orderId: order.id,
          total: Number(order.total_price || 0),
          currency: 'DZD',
          customer: {
            firstName: order.customer_first_name,
            lastName: order.customer_last_name,
            phone: order.customer_phone,
            commune: order.customer_commune,
            wilaya: order.customer_wilaya,
            country: 'dz',
          },
          items: (order.order_items || []).map((item) => ({
            id: item.product_id || item.id,
            quantity: item.quantity ?? 1,
            price: Number(item.price || item.products?.sale_price || 0),
          })),
          actionSource: 'system',
        })
        .catch((err) => {
          this.logger.error(
            `[CAPI] Offline COD delivery event error for order ${order.id}: ${err?.message || err}`,
          );
        });
    }

    return {
      message: 'Order updated successfully',
      data: order,
    };
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.orders.findUnique({
      where: { id },
      include: { order_items: true },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    if (existing.order_items.length > 0) {
      await this.prisma.order_items.deleteMany({
        where: { order_id: id },
      });
    }

    const order = await this.prisma.orders.delete({
      where: { id },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.DELETE,
      entity: AdminEntity.ORDER,
      entityId: id,
      description: 'Order deleted',
    });

    return {
      message: 'Order deleted successfully',
      data: order,
    };
  }

  async getStatuses() {
    const statuses = await this.prisma.order_statuses.findMany({
      orderBy: { created_at: 'asc' },
    });

    return {
      message: 'Order statuses',
      data: statuses,
    };
  }

  async findOneAdmin(id: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            products: {
              include: {
                gallery: true,
              },
            },
          },
        },
        customers: {
          include: { customer_addresses: true },
        },
        order_statuses: true,
        shipping_zones: true,
        shipping_communes: true,
        coupons: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return { message: 'Order details (admin)', data: order };
  }
}
