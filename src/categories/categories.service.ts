import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { AdminAction, AdminEntity } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminsLogsService: AdminsLogsService,
  ) {}

  async create(dto: CreateCategoryDto, adminId: string) {
    if (dto.parent_id) {
      const parent = await this.prisma.categories.findUnique({
        where: { id: dto.parent_id },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }

      if (parent.active === false) {
        throw new BadRequestException('Parent category is inactive');
      }
    }

    const category = await this.prisma.categories.create({
      data: {
        category_name: dto.category_name,
        category_description: dto.category_description,
        parent_id: dto.parent_id,
        active: dto.active ?? true,
        created_by: adminId,
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
    const categories = await this.prisma.categories.findMany({
      where: {
        parent_id: null,
        active: true,
      },
      include: {
        other_categories: {
          where: { active: true },
          include: {
            other_categories: {
              where: { active: true },
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

  async findOne(id: string) {
    const category = await this.prisma.categories.findUnique({
      where: { id },
      include: {
        categories: true,
        other_categories: {
          where: { active: true },
        },
        product_categories: true,
      },
    });

    if (!category || category.active === false) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category details',
      data: category,
    };
  }

  async update(id: string, dto: UpdateCategoryDto, adminId: string) {
    const existing = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!existing || existing.active === false) {
      throw new NotFoundException('Category not found');
    }

    if (dto.parent_id && dto.parent_id === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    if (dto.parent_id) {
      const parent = await this.prisma.categories.findUnique({
        where: { id: dto.parent_id },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }

      if (parent.active === false) {
        throw new BadRequestException('Parent category is inactive');
      }
    }

    const category = await this.prisma.categories.update({
      where: { id },
      data: {
        category_name: dto.category_name,
        category_description: dto.category_description,
        parent_id: dto.parent_id,
        active: dto.active,
        updated_by: adminId,
      },
    });

    await this.adminsLogsService.log({
      adminId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.CATEGORY,
      entityId: id,
      description: 'Category updated',
    });

    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.categories.findUnique({
      where: { id },
      include: {
        other_categories: {
          where: { active: true },
        },
      },
    });

    if (!existing || existing.active === false) {
      throw new NotFoundException('Category not found');
    }

    if (existing.other_categories.length > 0) {
      throw new BadRequestException(
        'Cannot disable category with active subcategories',
      );
    }

    const category = await this.prisma.categories.update({
      where: { id },
      data: {
        active: false,
        updated_by: adminId,
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
      message: 'Category disabled successfully',
      data: category,
    };
  }
}
