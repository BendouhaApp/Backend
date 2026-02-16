import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureLeadingSlash(mediaPath: string) {
    return mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  }

  private isHttpUrl(mediaPath: string) {
    return /^https?:\/\//i.test(mediaPath);
  }

  private toPublicMediaUrl(mediaPath: string, baseUrl: string) {
    if (this.isHttpUrl(mediaPath)) return mediaPath;
    if (!mediaPath.startsWith('/uploads/')) return mediaPath;
    return `${baseUrl}${mediaPath}`;
  }

  private toCartProduct(p: any, baseUrl: string) {
    const thumbnail = p.gallery?.find((g: any) => g.is_thumbnail)?.image ?? null;
    const categories = (p.product_categories ?? [])
      .map((pc: any) => pc.categories)
      .filter(Boolean);
    const subCategory = categories.find((c: any) => c.parent_id);
    const mainCategory = categories.find((c: any) => !c.parent_id);
    const categoryLabel =
      subCategory?.category_name ??
      categories[0]?.category_name ??
      p.product_type ??
      'Uncategorized';
    const categoryFallbackPath = this.ensureLeadingSlash(
      subCategory?.image ??
        mainCategory?.image ??
        '/images/categories/default-subcategory.svg',
    );
    const categoryFallbackUrl = this.toPublicMediaUrl(
      categoryFallbackPath,
      baseUrl,
    );
    const thumbnailUrl = thumbnail
      ? this.toPublicMediaUrl(this.ensureLeadingSlash(thumbnail), baseUrl)
      : null;

    return {
      id: p.id,
      name: p.product_name,
      slug: p.slug,
      price: parseFloat(p.sale_price.toString()),
      originalPrice: p.compare_price
        ? parseFloat(p.compare_price.toString())
        : null,
      category: categoryLabel,
      image: thumbnailUrl ?? categoryFallbackUrl,
      thumbnail: thumbnailUrl ?? categoryFallbackUrl,
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
                product_categories: {
                  include: { categories: true },
                },
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
                  product_categories: {
                    include: { categories: true },
                  },
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
