import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { AdminAction, AdminEntity } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  async create(dto: CreateProductDto, adminId: string) {
    const slug = slugify(dto.product_name, { lower: true });

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
        published: dto.published,
        disable_out_of_stock: dto.disable_out_of_stock,
        note: dto.note,
        created_by: adminId,
      },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.CREATE,
      entity: AdminEntity.PRODUCT,
      entityId: product.id,
      description: 'Product created',
    });

    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  async findAll() {
    const products = await this.prisma.products.findMany();

    return {
      message: 'List of all products',
      data: products,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product details',
      data: product,
    };
  }

  async update(id: string, dto: UpdateProductDto, adminId: string) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.prisma.products.update({
      where: { id },
      data: {
        ...dto,
        updated_by: adminId,
      },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.PRODUCT,
      entityId: id,
      description: 'Product updated',
    });

    return {
      message: 'Product updated successfully',
      data: product,
    };
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.prisma.products.delete({
      where: { id },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.DELETE,
      entity: AdminEntity.PRODUCT,
      entityId: id,
      description: 'Product deleted',
    });

    return {
      message: 'Product deleted successfully',
      data: product,
    };
  }
}
