import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { UpdateCartItemsDto } from './dto/update-cart-items.dto';

@Injectable()
export class CartItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(card_id: string, dto: CreateCartItemsDto) {
    const product = await this.prisma.products.findUnique({
      where: { id: dto.product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.card_items.findFirst({
      where: {
        card_id,
        product_id: dto.product_id,
      },
    });

    if (existing) {
      const updated = await this.prisma.card_items.update({
        where: { id: existing.id },
        data: {
          quantity: (existing.quantity ?? 1) + dto.quantity,
        },
      });

      return {
        message: 'Cart item updated',
        data: updated,
      };
    }

    const item = await this.prisma.card_items.create({
      data: {
        card_id,
        product_id: dto.product_id,
        quantity: dto.quantity,
      },
    });

    return {
      message: 'Item added to cart',
      data: item,
    };
  }

  async updateItem(id: string, dto: UpdateCartItemsDto) {
    const item = await this.prisma.card_items.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const updated = await this.prisma.card_items.update({
      where: { id },
      data: {
        quantity: dto.quantity,
      },
    });

    return {
      message: 'Cart item updated',
      data: updated,
    };
  }

  async removeItem(id: string) {
    const item = await this.prisma.card_items.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.card_items.delete({
      where: { id },
    });

    return {
      message: 'Cart item removed',
    };
  }
}
