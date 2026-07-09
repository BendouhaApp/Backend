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

  private toArray(value: unknown): unknown[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(/[\n,;]+/);
      }
    }
    return [];
  }

  private colorNames(value: unknown): string[] {
    return this.toArray(value)
      .map((entry) =>
        typeof entry === 'object' && entry !== null
          ? String((entry as Record<string, unknown>).name ?? '')
          : String(entry ?? '').split('|')[0],
      )
      .map((entry) => entry.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  private dimensionNames(value: unknown): string[] {
    return this.toArray(value)
      .map((entry) => String(entry ?? '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  async addToCart(card_id: string, dto: CreateCartItemsDto) {
    const product = await this.prisma.products.findUnique({
      where: { id: dto.product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const selectedColor = dto.color?.replace(/\s+/g, ' ').trim() || null;
    const selectedDimension =
      dto.dimension?.replace(/\s+/g, ' ').trim() || null;
    const availableColors = this.colorNames(product.colors);
    const availableDimensions = this.dimensionNames(product.dimensions);

    if (selectedColor && !availableColors.includes(selectedColor)) {
      throw new BadRequestException('Invalid product color');
    }

    if (
      selectedDimension &&
      !availableDimensions.includes(selectedDimension)
    ) {
      throw new BadRequestException('Invalid product dimension');
    }

    const existing = await this.prisma.card_items.findFirst({
      where: {
        card_id,
        product_id: dto.product_id,
        color: selectedColor,
        dimension: selectedDimension,
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
        color: selectedColor,
        dimension: selectedDimension,
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
