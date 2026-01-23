import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { UpdateCartItemsDto } from './dto/update-cart-items.dto';

@Injectable()
export class CartItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(cart_id: number, dto: CreateCartItemsDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cart_id_product_id: {
          cart_id,
          product_id: dto.product_id,
        },
      },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + dto.quantity,
          total_price: product.price.mul(existing.quantity + dto.quantity),
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cart_id,
        product_id: dto.product_id,
        quantity: dto.quantity,
        unit_price: product.price,
        total_price: product.price.mul(dto.quantity),
      },
    });
  }

  async updateItem(id: number, dto: UpdateCartItemsDto) {
    if (dto.quantity === undefined) {
      throw new BadRequestException('Quantity is required');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.update({
      where: { id },
      data: {
        quantity: dto.quantity,
        total_price: item.unit_price.mul(dto.quantity),
      },
    });
  }

  async removeItem(id: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id },
    });
  }
}
