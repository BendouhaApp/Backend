import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { AdminAction, AdminEntity } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor( private readonly prisma: PrismaService , private readonly adminsLogsService: AdminsLogsService ) {}

  async create(dto: CreateProductDto, adminId: number) {
    const slug = slugify(dto.name, { lower: true });

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        slug,
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
    const products = await this.prisma.product.findMany();

    return {
      message: 'List of all products',
      data: products,
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product with id ' + id,
      data: product,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto, adminId: number) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.PRODUCT,
      entityId: id,
      description: 'Product updated',
    });

    return {
      message: `Product #${id} updated successfully`,
      data: product,
    };
  }

  async remove(id: number, adminId: number) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.prisma.product.delete({
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
      message: `Product #${id} deleted successfully`,
      data: product,
    };
  }
}
