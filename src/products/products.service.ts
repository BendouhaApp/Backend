import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { AdminAction, AdminEntity } from '@prisma/client';
import slugify from 'slugify';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  private normalizeCategoryIds(input: unknown): string[] {
    if (!input) return [];
    const raw = Array.isArray(input) ? input : [input];
    const normalized = raw
      .map((value) => String(value).trim())
      .filter(Boolean);
    return Array.from(new Set(normalized));
  }

  private deleteFile(filePath?: string | null) {
    if (!filePath) return;

    const safePath = filePath.replace(/^\/+/, '');
    const fullPath = path.join(process.cwd(), safePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  // Normalize the public product payload to keep front-end consumers stable.
  private toPublicProduct(p: any, baseUrl: string) {
    const thumbnail = p.gallery?.find((g: any) => g.is_thumbnail)?.image ?? null;
    const categories = (p.product_categories ?? [])
      .map((pc: any) => pc.categories)
      .filter(Boolean)
      .map((c: any) => ({
        id: c.id,
        category_name: c.category_name,
        parent_id: c.parent_id,
        image: c.image ?? null,
      }));

    const categoryLabel =
      categories.find((c: any) => c.parent_id)?.category_name ??
      categories[0]?.category_name ??
      p.product_type ??
      'Uncategorized';

    return {
      id: p.id,
      name: p.product_name,
      slug: p.slug,
      price: parseFloat(p.sale_price.toString()),
      originalPrice: p.compare_price
        ? parseFloat(p.compare_price.toString())
        : null,
      category: categoryLabel,
      categories,
      description: p.short_description,
      fullDescription: p.product_description,
      image: thumbnail ? `${baseUrl}${thumbnail}` : '/placeholder.jpg',
      thumbnail: thumbnail ? `${baseUrl}${thumbnail}` : null,
      images: (p.gallery ?? []).map((g: any) => `${baseUrl}${g.image}`),
      gallery: (p.gallery ?? []).map((g: any) => `${baseUrl}${g.image}`),
      inStock: p.quantity > 0,
      quantity: p.quantity,
      rating: null,
      reviewCount: null,
      badge: null,
      sizes: null,
      colors: null,
      materials: null,
      dimensions: null,
      care: null,
      cct: p.cct,
      lumen: p.lumen,
      cri: p.cri,
      power: p.power ? parseFloat(p.power.toString()) : null,
      angle: p.angle,
    };
  }

  async create(dto: any, adminId: string) {
    const slug = slugify(dto.slug || dto.product_name, { lower: true });
    const rawCategoryIds = dto.category_ids ?? dto['category_ids[]'];
    const categoryIds = this.normalizeCategoryIds(rawCategoryIds);

    const product = await this.prisma.products.create({
      data: {
        slug,
        product_name: dto.product_name,
        sku: dto.sku || null,

        sale_price: Number(dto.sale_price ?? 0),
        compare_price:
          dto.compare_price != null ? Number(dto.compare_price) : null,
        buying_price:
          dto.buying_price != null ? Number(dto.buying_price) : null,

        quantity: Number(dto.quantity ?? 0),

        short_description: dto.short_description,
        product_description: dto.product_description,
        product_type: dto.product_type || null,

        published: dto.published === true || dto.published === 'true',
        disable_out_of_stock:
          dto.disable_out_of_stock === true ||
          dto.disable_out_of_stock === 'true',

        note: dto.note || null,
        created_by: adminId,

        cct: Number(dto.cct ?? 0),
        lumen: Number(dto.lumen ?? 0),
        cri: Number(dto.cri ?? 0),
        power: Number(dto.power ?? 0),
        angle: Number(dto.angle ?? 0),

        gallery: {
          create: [
            ...(dto.thumbnail
              ? [
                  {
                    image: dto.thumbnail,
                    placeholder: '',
                    is_thumbnail: true,
                  },
                ]
              : []),
            ...(dto.images ?? []).map((img: string) => ({
              image: img,
              placeholder: '',
              is_thumbnail: false,
            })),
          ],
        },
        ...(categoryIds.length > 0 && {
          product_categories: {
            create: categoryIds.map((category_id) => ({ category_id })),
          },
        }),
      },
      include: {
        gallery: true,
        product_categories: {
          include: { categories: true },
        },
      },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.CREATE,
      entity: AdminEntity.PRODUCT,
      entityId: product.id,
      description: 'Product created',
    });

    return product;
  }

  async findAll({
    page,
    limit,
    search,
    status,
    categoryId,
  }: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    categoryId?: string;
  }) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};

    const q = search?.trim();
    if (q) {
      where.OR = [
        { product_name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { product_type: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (status === 'published') {
      where.published = true;
    }

    if (status === 'draft') {
      where.published = false;
    }

    if (categoryId) {
      where.product_categories = {
        some: {
          category_id: categoryId,
        },
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.products.findMany({
        where,
        skip,
        take: safeLimit,
        include: {
          gallery: true,
          product_categories: {
            include: { categories: true },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.products.count({ where }),
    ]);

    const data = items.map((p) => ({
      ...p,
      thumbnail: p.gallery.find((g) => g.is_thumbnail)?.image ?? null,
      gallery: p.gallery.map((g) => g.image),
    }));

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.products.findFirst({
      where: {
        id,
      },
      include: {
        gallery: true,
        product_categories: {
          include: { categories: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const thumbnail =
      product.gallery.find((g) => g.is_thumbnail)?.image ?? null;

    return {
      ...product,
      thumbnail,
      gallery: product.gallery.map((g) => g.image),
    };
  }

  async update(id: string, dto: any, adminId: string) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
      include: { gallery: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const { images, thumbnail, removed_images = [], slug, ...rest } = dto;
    const rawCategoryIds = dto.category_ids ?? dto['category_ids[]'];
    const categoryIds =
      rawCategoryIds !== undefined
        ? this.normalizeCategoryIds(rawCategoryIds)
        : undefined;

    const finalSlug =
      slug && slug !== existing.slug
        ? slugify(slug, { lower: true })
        : undefined;

    const normalizedData = {
      ...rest,
      sku: rest.sku || null,
      sale_price: rest.sale_price != null ? Number(rest.sale_price) : undefined,
      compare_price:
        rest.compare_price != null ? Number(rest.compare_price) : null,
      buying_price:
        rest.buying_price != null ? Number(rest.buying_price) : null,
      quantity: rest.quantity != null ? Number(rest.quantity) : undefined,
      published: rest.published === true || rest.published === 'true',
      disable_out_of_stock:
        rest.disable_out_of_stock === true ||
        rest.disable_out_of_stock === 'true',
      product_type: rest.product_type || null,
      note: rest.note || null,
      ...(finalSlug ? { slug: finalSlug } : {}),
      updated_by: adminId,
      ...(dto.cct !== undefined && { cct: Number(dto.cct) }),
      ...(dto.lumen !== undefined && { lumen: Number(dto.lumen) }),
      ...(dto.cri !== undefined && { cri: Number(dto.cri) }),
      ...(dto.power !== undefined && { power: Number(dto.power) }),
      ...(dto.angle !== undefined && { angle: Number(dto.angle) }),
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.products.update({
        where: { id },
        data: normalizedData,
      });

      if (categoryIds !== undefined) {
        await tx.product_categories.deleteMany({
          where: { product_id: id },
        });

        if (categoryIds.length > 0) {
          await tx.product_categories.createMany({
            data: categoryIds.map((category_id) => ({
              product_id: id,
              category_id,
            })),
          });
        }
      }

      if (removed_images.length) {
        const toDelete = await tx.gallery.findMany({
          where: {
            product_id: id,
            image: { in: removed_images },
          },
        });

        for (const img of toDelete) {
          this.deleteFile(img.image);
        }

        await tx.gallery.deleteMany({
          where: {
            product_id: id,
            image: { in: removed_images },
          },
        });
      }

      if (thumbnail) {
        const oldThumb = await tx.gallery.findFirst({
          where: {
            product_id: id,
            is_thumbnail: true,
          },
        });

        if (oldThumb) {
          this.deleteFile(oldThumb.image);
          await tx.gallery.delete({ where: { id: oldThumb.id } });
        }

        await tx.gallery.create({
          data: {
            product_id: id,
            image: thumbnail,
            placeholder: '',
            is_thumbnail: true,
          },
        });
      }

      if (images?.length) {
        await tx.gallery.createMany({
          data: images.map((img: string) => ({
            product_id: id,
            image: img,
            placeholder: '',
            is_thumbnail: false,
          })),
        });
      }
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.PRODUCT,
      entityId: id,
      description: 'Product updated',
    });

    return this.findOne(id);
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
      include: { gallery: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const img of existing.gallery) {
        this.deleteFile(img.image);
      }

      await tx.gallery.deleteMany({
        where: { product_id: id },
      });

      await tx.products.delete({
        where: { id },
      });
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.DELETE,
      entity: AdminEntity.PRODUCT,
      entityId: id,
      description: 'Product deleted',
    });

    return { success: true };
  }

  async findPublic() {
    //for one product details
    const products = await this.prisma.products.findMany({
      where: {
        published: true,
        NOT: {
          AND: [{ quantity: 0 }, { disable_out_of_stock: true }],
        },
      },
      include: {
        gallery: true,
        product_categories: {
          include: { categories: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const baseUrl = process.env.API_URL || 'http://localhost:3000';

    return products.map((p) => this.toPublicProduct(p, baseUrl));
  }

  async findPublicOne(id: string) {
    const product = await this.prisma.products.findFirst({
      where: {
        id,
        published: true,
      },
      include: {
        gallery: true,
        product_categories: {
          include: { categories: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.quantity === 0 && product.disable_out_of_stock) {
      throw new NotFoundException('Product not available');
    }

    const baseUrl = process.env.API_URL || 'http://localhost:3000';

    return this.toPublicProduct(product, baseUrl);
  }

  async bulkUpdate(dto: { ids: string[]; published?: boolean }) {
    if (!dto.ids?.length) {
      throw new BadRequestException('No product IDs provided');
    }

    return this.prisma.products.updateMany({
      where: {
        id: { in: dto.ids },
      },
      data: {
        ...(dto.published !== undefined && {
          published: dto.published,
        }),
      },
    });
  }

  async bulkDelete(ids: string[], adminId?: string) {
    if (!ids?.length) {
      throw new BadRequestException('No product IDs provided');
    }

    const products = await this.prisma.products.findMany({
      where: { id: { in: ids } },
      include: { gallery: true },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const product of products) {
        await tx.card_items.deleteMany({
          where: { product_id: product.id },
        });

        for (const img of product.gallery) {
          this.deleteFile(img.image);
        }

        await tx.gallery.deleteMany({
          where: { product_id: product.id },
        });

        await tx.products.delete({
          where: { id: product.id },
        });
      }
    });

    for (const product of products) {
      await this.adminsLogsService.log({
        adminId: adminId ?? 'system',
        action: AdminAction.DELETE,
        entity: AdminEntity.PRODUCT,
        entityId: product.id,
        description: 'Product deleted (bulk)',
      });
    }

    return { success: true, count: products.length };
  }
}
