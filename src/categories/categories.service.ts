import { Injectable , BadRequestException , NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { AdminAction, AdminEntity } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  async create(dto: CreateCategoryDto, adminId: number) {
    const slug = slugify(dto.name, { lower: true });

    if (dto.parent_id) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parent_id },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }

      if (!parent.is_active) {
        throw new BadRequestException('Parent category is inactive');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        parent_id: dto.parent_id,
        is_active: dto.is_active ?? true,
      },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.CREATE,
      entity: AdminEntity.CATEGORY,
      entityId: category.id,
      description: 'Category created',
    });

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: {
        parent_id: null,
        is_active: true,
      },
      include: {
        children: {
          where: { is_active: true },
          include: {
            children: {
              where: { is_active: true },
            },
          },
        },
      },
    });

    return {
      message: 'Categories tree',
      data: categories,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { is_active: true },
        },
        products: true,
      },
    });

    if (!category || !category.is_active) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: `Category #${id}`,
      data: category,
    };
  }

  async update(id: number, dto: UpdateCategoryDto, adminId: number) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existing || !existing.is_active) {
      throw new NotFoundException('Category not found');
    }

    if (dto.parent_id === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    if (dto.parent_id) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parent_id },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }

      if (!parent.is_active) {
        throw new BadRequestException('Parent category is inactive');
      }

      if (parent.parent_id === id) {
        throw new BadRequestException(
          'Circular category relationship detected',
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        parent_id: dto.parent_id,
        is_active: dto.is_active,
        slug: dto.name ? slugify(dto.name, { lower: true }) : undefined,
        updated_at: new Date(),
      },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.CATEGORY,
      entityId: category.id,
      description: 'Category updated',
    });

    return {
      message: `Category #${id} updated successfully`,
      data: category,
    };
  }

  async remove(id: number, adminId: number) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          where: { is_active: true },
        },
      },
    });

    if (!existing || !existing.is_active) {
      throw new NotFoundException('Category not found');
    }

    if (existing.children.length > 0) {
      throw new BadRequestException(
        'Cannot disable category with active subcategories',
      );
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.DELETE,
      entity: AdminEntity.CATEGORY,
      entityId: id,
      description: 'Category disabled',
    });

    return {
      message: `Category #${id} disabled successfully`,
      data: category,
    };
  }
}
