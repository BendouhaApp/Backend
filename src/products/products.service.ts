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
              ? [
                  {
                    image: dto.thumbnail,
                    placeholder: '',
                    is_thumbnail: true,
                  },
                ]
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

    // ✅ LOG CREATE
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
     UPDATE PRODUCT
  ========================= */
  async update(id: string, dto: UpdateProductDto, adminId: string) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    // remove old gallery
    await this.prisma.gallery.deleteMany({
      where: { product_id: id },
    });

    const product = await this.prisma.products.update({
      where: { id },
      data: {
        ...dto,
        slug: dto.slug
          ? slugify(dto.slug, { lower: true })
          : existing.slug,
        updated_by: adminId,
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

    // ✅ LOG UPDATE
    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.PRODUCT,
      entityId: id,
      description: 'Product updated',
    });

    return product;
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

    // ✅ LOG DELETE
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
