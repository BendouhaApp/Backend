import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(user_id?: number) {
    let cart = await this.prisma.cart.findFirst({
      where: { user_id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { user_id },
        include: {
          items: { include: { product: true } },
        },
      });
    }

    return cart;
  }

  async clearCart(user_id?: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { user_id },
    });

    if (!cart) return;

    await this.prisma.cartItem.deleteMany({
      where: { cart_id: cart.id },
    });
  }
}

