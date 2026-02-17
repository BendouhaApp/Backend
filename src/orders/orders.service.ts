import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminAction, AdminEntity, Prisma } from '@prisma/client';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  async create(card_id: string, dto: CreateOrderDto) {
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

    const orderId = `ORD-${Date.now()}`;

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
          })),
        },
      },
      include: {
        order_items: {
          include: { products: true },
        },
        customers: true,
        order_statuses: true,
        shipping_zones: true,
        shipping_communes: true,
      },
    });

    await this.prisma.card_items.deleteMany({
      where: { card_id },
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
          customers: true,
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

  async findOne(id: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: {
          include: { products: true },
        },
        customers: true,
        order_statuses: true,
        shipping_zones: true,
        shipping_communes: true,
      },
    });

    if (!order) {
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
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.ORDER,
      entityId: id,
      description: 'Order status updated',
    });

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
