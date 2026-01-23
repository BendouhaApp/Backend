import { Injectable , NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

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

    let productName: string | null = null;
    let productSku: string | null = null;

    if (dto.product_id) {
      const product = await this.prisma.products.findUnique({
        where: { id: dto.product_id },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      productName = product.name;
      productSku = product.sku;
    }

    const totalPrice = dto.quantity * dto.unit_price;

    const orderItem = await this.prisma.order_items.create({
      data: {
        order_id: dto.order_id,
        product_id: dto.product_id,
        product_name: productName ?? 'Custom item',
        product_sku: productSku,
        quantity: dto.quantity,
        unit_price: dto.unit_price,
        total_price: totalPrice,
      },
    });

    return {
      message: 'Order item created successfully',
      data: orderItem,
    };
  }

  async findAll() {
    const items = await this.prisma.order_items.findMany({
      include: {
        products: true,
        orders: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      message: 'Order items list',
      data: items,
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.order_items.findUnique({
      where: { id },
      include: {
        products: true,
        orders: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    return {
      message: `Order item #${id}`,
      data: item,
    };
  }

  async update(id: number, dto: UpdateOrderItemDto) {
    const existing = await this.prisma.order_items.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Order item not found');
    }

    const quantity = dto.quantity ?? existing.quantity;
    const unitPrice = dto.unit_price ?? existing.unit_price;

    const updatedItem = await this.prisma.order_items.update({
      where: { id },
      data: {
        ...dto,
        total_price: quantity * unitPrice,
      },
    });

    return {
      message: `Order item #${id} updated successfully`,
      data: updatedItem,
    };
  }

  async remove(id: number) {
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
      message: `Order item #${id} deleted successfully`,
    };
  }
}
