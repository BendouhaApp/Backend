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
    const normalized = raw.map((value) => String(value).trim()).filter(Boolean);
    return Array.from(new Set(normalized));
  }

  private deleteFile(filePath?: string | null) {
    if (!filePath) return;

    if (/^https?:\/\//i.test(filePath)) return;

    const safePath = filePath.replace(/^\/+/, '');

    if (!safePath.startsWith('uploads/')) return;

    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const fullPath = path.resolve(process.cwd(), safePath);

    if (!fullPath.startsWith(uploadsDir)) return;

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  private ensureLeadingSlash(mediaPath: string) {
    return mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  }

  private isHttpUrl(mediaPath: string) {
    return /^https?:\/\//i.test(mediaPath);
  }

  private mediaFileExists(mediaPath?: string | null) {
    if (!mediaPath) return false;
    if (this.isHttpUrl(mediaPath)) return true;

    const normalized = this.ensureLeadingSlash(mediaPath);
    const safePath = normalized.replace(/^\/+/, '');

    if (!safePath.startsWith('uploads/')) {
      return true;
    }

    return fs.existsSync(path.join(process.cwd(), safePath));
  }

  private normalizeStoredMediaPath(mediaPath: string) {
    return this.isHttpUrl(mediaPath)
      ? mediaPath
      : this.ensureLeadingSlash(mediaPath);
  }

  private resolveGalleryPaths(gallery: Array<{ image?: string | null }> = []) {
    const unique = new Set<string>();
    const paths: string[] = [];

    for (const item of gallery) {
      const image = item?.image?.trim();
      if (!image || unique.has(image) || !this.mediaFileExists(image)) continue;
      unique.add(image);
      paths.push(this.normalizeStoredMediaPath(image));
    }

    return paths;
  }

  private resolveThumbnailPath(
    gallery: Array<{
      image?: string | null;
      is_thumbnail?: boolean | null;
    }> = [],
    fallbackGallery: string[] = [],
  ) {
    const preferred = gallery.find((g) => g.is_thumbnail)?.image?.trim();
    if (preferred && this.mediaFileExists(preferred)) {
      return this.normalizeStoredMediaPath(preferred);
    }

    return fallbackGallery[0] ?? null;
  }

  private toPublicMediaUrl(mediaPath: string, baseUrl: string) {
    return this.isHttpUrl(mediaPath) ? mediaPath : `${baseUrl}${mediaPath}`;
  }

  // Normalize the public product payload to keep front-end consumers stable.
  private toPublicProduct(p: any, baseUrl: string) {
    const galleryPaths = this.resolveGalleryPaths(p.gallery ?? []);
    const thumbnailPath = this.resolveThumbnailPath(
      p.gallery ?? [],
      galleryPaths,
    );
    const thumbnailUrl = thumbnailPath
      ? this.toPublicMediaUrl(thumbnailPath, baseUrl)
      : null;
    const galleryUrls = galleryPaths.map((image) =>
      this.toPublicMediaUrl(image, baseUrl),
    );
    const categories = (p.product_categories ?? [])
      .map((pc: any) => pc.categories)
      .filter(Boolean)
      .map((c: any) => ({
        id: c.id,
        category_name: c.category_name,
        parent_id: c.parent_id,
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
      image: thumbnailUrl ?? '/placeholder.jpg',
      thumbnail: thumbnailUrl,
      images: galleryUrls,
      gallery: galleryUrls,
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

  // Only showing the updated findAll method - replace this method in your existing file

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
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
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

    // Enhanced category filtering: include products from selected category AND its subcategories
    if (categoryId) {
      const categoryIds = [categoryId];

      // Get all subcategories
      const subcategories = await this.prisma.categories.findMany({
        where: { parent_id: categoryId },
        select: { id: true },
      });

      subcategories.forEach((sub) => categoryIds.push(sub.id));

      where.product_categories = {
        some: {
          category_id: { in: categoryIds },
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

    const data = items.map((p) => {
      const galleryPaths = this.resolveGalleryPaths(p.gallery ?? []);
      const thumbnailPath = this.resolveThumbnailPath(
        p.gallery ?? [],
        galleryPaths,
      );

      return {
        ...p,
        thumbnail: thumbnailPath,
        gallery: galleryPaths,
      };
    });

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

  async findPublic({
    categoryId,
    page,
    limit,
  }: {
    categoryId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 9));
    const skip = (safePage - 1) * safeLimit;

    const categoryFilterIds: string[] = [];

    if (categoryId) {
      categoryFilterIds.push(categoryId);

      const children = await this.prisma.categories.findMany({
        where: { parent_id: categoryId },
        select: { id: true },
      });

      for (const child of children) {
        categoryFilterIds.push(child.id);
      }
    }

    const where: any = {
      published: true,
    };

    if (categoryFilterIds.length > 0) {
      where.product_categories = {
        some: {
          category_id: { in: categoryFilterIds },
        },
      };
    }

    const baseUrl = process.env.API_URL || 'http://localhost:3000';

    const [products, total] = await this.prisma.$transaction([
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

    return {
      data: products.map((p) => this.toPublicProduct(p, baseUrl)),
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

    const galleryPaths = this.resolveGalleryPaths(product.gallery ?? []);
    const thumbnailPath = this.resolveThumbnailPath(
      product.gallery ?? [],
      galleryPaths,
    );

    return {
      ...product,
      thumbnail: thumbnailPath,
      gallery: galleryPaths,
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

    const {
      images,
      thumbnail,
      removed_images = [],
      slug,
      category_ids,
      ['category_ids[]']: category_ids_array,
    } = dto;

    const rawCategoryIds = category_ids ?? category_ids_array;
    const categoryIds =
      rawCategoryIds !== undefined
        ? this.normalizeCategoryIds(rawCategoryIds)
        : undefined;

    const finalSlug =
      slug && slug !== existing.slug
        ? slugify(slug, { lower: true })
        : undefined;

    const has = (key: string) => Object.prototype.hasOwnProperty.call(dto, key);

    const data: any = {
      updated_by: adminId,
    };

    if (finalSlug) data.slug = finalSlug;

    if (has('product_name')) data.product_name = dto.product_name;
    if (has('short_description'))
      data.short_description = dto.short_description;
    if (has('product_description'))
      data.product_description = dto.product_description;

    if (has('sku')) data.sku = dto.sku ? String(dto.sku) : null;

    if (has('sale_price')) {
      data.sale_price = Number(dto.sale_price ?? 0);
    }

    if (has('quantity')) {
      data.quantity = Number(dto.quantity ?? 0);
    }

    if (has('compare_price')) {
      const v = dto.compare_price;
      data.compare_price =
        v === '' || v === null || v === undefined ? null : Number(v);
    }

    if (has('buying_price')) {
      const v = dto.buying_price;
      data.buying_price =
        v === '' || v === null || v === undefined ? null : Number(v);
    }

    if (has('published')) {
      data.published = dto.published === true || dto.published === 'true';
    }

    if (has('disable_out_of_stock')) {
      data.disable_out_of_stock =
        dto.disable_out_of_stock === true ||
        dto.disable_out_of_stock === 'true';
    }

    if (has('product_type')) {
      data.product_type = dto.product_type ? String(dto.product_type) : null;
    }

    if (has('note')) {
      data.note = dto.note ? String(dto.note) : null;
    }

    if (has('cct')) data.cct = Number(dto.cct ?? 0);
    if (has('lumen')) data.lumen = Number(dto.lumen ?? 0);
    if (has('cri')) data.cri = Number(dto.cri ?? 0);
    if (has('power')) data.power = Number(dto.power ?? 0);
    if (has('angle')) data.angle = Number(dto.angle ?? 0);

    await this.prisma.$transaction(async (tx) => {
      await tx.products.update({
        where: { id },
        data,
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

      if (Array.isArray(removed_images) && removed_images.length > 0) {
        const imagesToDelete = await tx.gallery.findMany({
          where: {
            product_id: id,
            image: { in: removed_images },
          },
        });

        for (const img of imagesToDelete) {
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

          await tx.gallery.delete({
            where: { id: oldThumb.id },
          });
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

      if (Array.isArray(images) && images.length > 0) {
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

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
      include: {
        gallery: true,
        order_items: { select: { id: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (existing.order_items.length > 0) {
      throw new BadRequestException(
        'Cannot delete product that exists in orders. Mark it as unpublished instead.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.card_items.deleteMany({
        where: { product_id: id },
      });

      await tx.product_categories.deleteMany({
        where: { product_id: id },
      });

      await tx.product_tags.deleteMany({
        where: { product_id: id },
      });

      await tx.product_coupons.deleteMany({
        where: { product_id: id },
      });

      await tx.product_suppliers.deleteMany({
        where: { product_id: id },
      });

      await tx.product_attributes.deleteMany({
        where: { product_id: id },
      });

      await tx.variant_options.deleteMany({
        where: { product_id: id },
      });

      await tx.variants.deleteMany({
        where: { product_id: id },
      });

      await tx.product_shipping_info.deleteMany({
        where: { product_id: id },
      });

      await tx.sells.deleteMany({
        where: { product_id: id },
      });

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

  async bulkUpdate(
    dto: {
      ids: string[];
      published?: boolean;
      disable_out_of_stock?: boolean;
      quantity?: number;
    },
    adminId: string,
  ) {
    if (!dto.ids?.length) {
      throw new BadRequestException('No product IDs provided');
    }

    const data: any = {};

    if (typeof dto.published === 'boolean') {
      data.published = dto.published;
    }

    if (typeof dto.disable_out_of_stock === 'boolean') {
      data.disable_out_of_stock = dto.disable_out_of_stock;
    }

    if (typeof dto.quantity === 'number') {
      data.quantity = dto.quantity;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nothing to update');
    }

    const result = await this.prisma.products.updateMany({
      where: { id: { in: dto.ids } },
      data,
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.PRODUCT,
      entityId: 'bulk',
      description: `Bulk updated ${dto.ids.length} products`,
    });

    return result;
  }

  async bulkDelete(ids: string[], adminId?: string) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('No product IDs provided');
    }

    const uniqueIds = [...new Set(ids)];

    const products = await this.prisma.products.findMany({
      where: { id: { in: uniqueIds } },
      include: {
        gallery: true,
        order_items: { select: { id: true } },
      },
    });

    if (products.length === 0) {
      return { success: true, count: 0 };
    }

    const productsInOrders = products.filter((p) => p.order_items.length > 0);

    if (productsInOrders.length > 0) {
      throw new BadRequestException(
        `Cannot delete ${productsInOrders.length} product(s) that exist in orders. Mark them as unpublished instead.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.card_items.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.product_categories.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.product_tags.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.product_coupons.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.product_suppliers.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.product_attributes.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.variant_options.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.variants.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.product_shipping_info.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.sells.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      for (const product of products) {
        for (const img of product.gallery) {
          this.deleteFile(img.image);
        }
      }

      await tx.gallery.deleteMany({
        where: { product_id: { in: uniqueIds } },
      });

      await tx.products.deleteMany({
        where: { id: { in: uniqueIds } },
      });
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

    return {
      success: true,
      count: products.length,
    };
  }
}
