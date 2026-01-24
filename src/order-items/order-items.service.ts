import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderItemDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.order_id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const total_price = new Prisma.Decimal(dto.unit_price).mul(dto.quantity);

    const item = await this.prisma.orderItem.create({
      data: {
        order_id: dto.order_id,
        product_id: dto.product_id,
        product_name: dto.product_name,
        product_sku: dto.product_sku,
        quantity: dto.quantity,
        unit_price: new Prisma.Decimal(dto.unit_price),
        total_price,
      },
    });

    return {
      message: 'Order item created successfully',
      data: item,
    };
  }

  async findByOrder(order_id: number) {
    return {
      message: 'Order items list',
      data: await this.prisma.orderItem.findMany({
        where: { order_id },
      }),
    };
  }

  async update(id: number, dto: UpdateOrderItemDto) {
    const existing = await this.prisma.orderItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Order item not found');
    }

    const quantity = dto.quantity ?? existing.quantity;
    const unitPrice =
      dto.unit_price !== undefined
        ? new Prisma.Decimal(dto.unit_price)
        : existing.unit_price;

    const updated = await this.prisma.orderItem.update({
      where: { id },
      data: {
        ...dto,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice.mul(quantity),
      },
    });

    return {
      message: `Order item #${id} updated`,
      data: updated,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.orderItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Order item not found');
    }

    await this.prisma.orderItem.delete({
      where: { id },
    });

    return {
      message: `Order item #${id} deleted`,
    };
  }
}
