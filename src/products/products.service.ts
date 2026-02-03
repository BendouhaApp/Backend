import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { AdminAction, AdminEntity } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  /* =========================
     CREATE PRODUCT
  ========================= */
  async create(dto: CreateProductDto, adminId: string) {
    const slug = slugify(dto.slug || dto.product_name, { lower: true });

    const product = await this.prisma.products.create({
      data: {
        slug,
        product_name: dto.product_name,
        sku: dto.sku,
        sale_price: dto.sale_price,
        compare_price: dto.compare_price,
        buying_price: dto.buying_price,
        quantity: dto.quantity,
        short_description: dto.short_description,
        product_description: dto.product_description,
        product_type: dto.product_type,
        published: dto.published ?? false,
        disable_out_of_stock: dto.disable_out_of_stock ?? true,
        note: dto.note,
        created_by: adminId,
        gallery: {
          create: [
            ...(dto.thumbnail
              ? [{
                  image: dto.thumbnail,
                  placeholder: '',
                  is_thumbnail: true,
                }]
              : []),
            ...(dto.images ?? []).map((img) => ({
              image: img,
              placeholder: '',
              is_thumbnail: false,
            })),
          ],
        },
      },
      include: { gallery: true },
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

  /* =========================
     FIND ALL (ADMIN)
  ========================= */
  async findAll() {
    return this.prisma.products.findMany({
      include: { gallery: true },
      orderBy: { created_at: 'desc' },
    });
  }

  /* =========================
     FIND ONE
  ========================= */
  async findOne(id: string) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: { gallery: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /* =========================
     UPDATE PRODUCT (FIXED)
  ========================= */
  async update(id: string, dto: UpdateProductDto, adminId: string) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const {
      images,
      thumbnail,
      slug,
      ...productData
    } = dto;

    const finalSlug =
      slug && slug !== existing.slug
        ? slugify(slug, { lower: true })
        : undefined;

    const product = await this.prisma.$transaction(async (tx) => {
      // update product (ONLY product fields)
      const updated = await tx.products.update({
        where: { id },
        data: {
          ...productData,
          ...(finalSlug ? { slug: finalSlug } : {}),
          updated_by: adminId,
        },
      });

      // sync gallery if provided
      if (images || thumbnail) {
        await tx.gallery.deleteMany({
          where: { product_id: id },
        });

        const galleryData = [
          ...(thumbnail
            ? [{
                product_id: id,
                image: thumbnail,
                placeholder: '',
                is_thumbnail: true,
              }]
            : []),
          ...(images ?? []).map((img) => ({
            product_id: id,
            image: img,
            placeholder: '',
            is_thumbnail: false,
          })),
        ];

        if (galleryData.length) {
          await tx.gallery.createMany({
            data: galleryData,
          });
        }
      }

      return updated;
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

  /* =========================
     DELETE PRODUCT
  ========================= */
  async remove(id: string, adminId: string) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.products.delete({
      where: { id },
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

  /* =========================
     PUBLIC PRODUCTS
  ========================= */
  async findPublic() {
    return this.prisma.products.findMany({
      where: {
        published: true,
        OR: [
          { quantity: { gt: 0 } },
          { disable_out_of_stock: false },
        ],
      },
      include: { gallery: true },
      orderBy: { created_at: 'desc' },
    });
  }
}
