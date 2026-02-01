import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(customer_id?: string) {
    let card = await this.prisma.cards.findFirst({
      where: { customer_id },
      include: {
        card_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!card) {
      card = await this.prisma.cards.create({
        data: { customer_id },
        include: {
          card_items: {
            include: {
              products: true,
            },
          },
        },
      });
    }

    return {
      message: 'Cart retrieved successfully',
      data: card,
    };
  }

  async clearCart(customer_id?: string) {
    const card = await this.prisma.cards.findFirst({
      where: { customer_id },
    });

    if (!card) {
      return {
        message: 'Cart not found',
      };
    }

    await this.prisma.card_items.deleteMany({
      where: { card_id: card.id },
    });

    return {
      message: 'Cart cleared successfully',
    };
  }
}
