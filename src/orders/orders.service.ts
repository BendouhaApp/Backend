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
    const card = await this.prisma.cards.findUnique({
      where: { id: card_id },
      include: {
        card_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!card || card.card_items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const orderId = `ORD-${Date.now()}`;

    const order = await this.prisma.orders.create({
      data: {
        id: orderId,
        customer_id: dto.customer_id,
        coupon_id: dto.coupon_id,
        order_status_id: dto.order_status_id,
        order_items: {
          create: card.card_items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity ?? 1,
            price: new Prisma.Decimal(item.products?.sale_price ?? 0),
          })),
        },
      },
      include: {
        order_items: true,
      },
    });

    await this.prisma.card_items.deleteMany({
      where: { card_id },
    });

    return {
      message: 'Order created successfully',
      data: order,
    };
  }

async findAll({ page, limit }: { page: number; limit: number }) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    this.prisma.orders.findMany({
      skip,
      take: safeLimit,
      include: {
        order_items: true,
        customers: true,
        order_statuses: true,
      },
      orderBy: {
        created_at: 'desc',
      },
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
        order_items: true,
        customers: true,
        order_statuses: true,
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
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
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
}
