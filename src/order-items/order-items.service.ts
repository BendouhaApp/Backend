import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderItemDto) {
    const order = await this.prisma.orders.findUnique({
      where: { id: dto.order_id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const item = await this.prisma.order_items.create({
      data: {
        order_id: dto.order_id,
        product_id: dto.product_id,
        quantity: dto.quantity,
        price: new Prisma.Decimal(dto.price),
      },
    });

    return {
      message: 'Order item created successfully',
      data: item,
    };
  }

  async findByOrder(order_id: string) {
    const items = await this.prisma.order_items.findMany({
      where: { order_id },
    });

    return {
      message: 'Order items list',
      data: items,
    };
  }

  async update(id: string, dto: UpdateOrderItemDto) {
    const existing = await this.prisma.order_items.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Order item not found');
    }

    const updated = await this.prisma.order_items.update({
      where: { id },
      data: {
        quantity: dto.quantity ?? existing.quantity,
        price:
          dto.price !== undefined
            ? new Prisma.Decimal(dto.price)
            : existing.price,
      },
    });

    return {
      message: 'Order item updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.order_items.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Order item not found');
    }

    await this.prisma.order_items.delete({
      where: { id },
    });

    return {
      message: 'Order item deleted successfully',
    };
  }
}
