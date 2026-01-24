import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(cart_id: number, dto: CreateOrderDto, admin_id?: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cart_id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum.add(item.total_price),
      new Prisma.Decimal(0),
    );


    const order = await this.prisma.order.create({
      data: {
        order_number: `ORD-${Date.now()}`,
        customer_name: dto.customer_name,
        customer_phone: dto.customer_phone,
        customer_wilaya: dto.customer_wilaya,
        total_amount: totalAmount,
        status: 'PENDING',
        created_by: admin_id,
        items: {
          create: cart.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product?.name ?? 'Deleted product',
            product_sku: item.product?.sku ?? null,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await this.prisma.cartItem.deleteMany({
      where: { cart_id },
    });

    return {
      message: 'Order created successfully',
      data: order,
    };
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });

    return {
      message: 'Orders list',
      data: orders,
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: `Order #${id}`,
      data: order,
    };
  }

  async update(id: number, dto: UpdateOrderDto) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    return {
      message: `Order #${id} updated successfully`,
      data: order,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.order.delete({
      where: { id },
    });

    return {
      message: `Order #${id} deleted successfully`,
      data: order,
    };
  }
}
