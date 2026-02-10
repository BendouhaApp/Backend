import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private toCartProduct(p: any, baseUrl: string) {
    const thumbnail = p.gallery?.find((g: any) => g.is_thumbnail)?.image ?? null;
    return {
      id: p.id,
      name: p.product_name,
      slug: p.slug,
      price: parseFloat(p.sale_price.toString()),
      originalPrice: p.compare_price
        ? parseFloat(p.compare_price.toString())
        : null,
      category: p.product_type || 'Uncategorized',
      image: thumbnail ? `${baseUrl}${thumbnail}` : '/placeholder.jpg',
      thumbnail: thumbnail ? `${baseUrl}${thumbnail}` : null,
      inStock: p.quantity > 0,
      quantity: p.quantity,
    };
  }

  async getCart(customer_id?: string) {
    let card = await this.prisma.cards.findFirst({
      where: { customer_id },
      include: {
        card_items: {
          include: {
            products: {
              include: {
                gallery: true,
              },
            },
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
              products: {
                include: {
                  gallery: true,
                },
              },
            },
          },
        },
      });
    }

    return {
      message: 'Cart retrieved successfully',
      data: {
        ...card,
        card_items: card.card_items.map((item) => ({
          ...item,
          product: item.products
            ? this.toCartProduct(
                item.products,
                process.env.API_URL || 'http://localhost:3000',
              )
            : null,
        })),
      },
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
