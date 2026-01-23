import { Injectable , BadRequestException , NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = slugify(createCategoryDto.name, { lower: true });

    if (createCategoryDto.parent_id) {
      const parent = await this.prisma.categories.findUnique({
        where: { id: createCategoryDto.parent_id },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    const category = await this.prisma.categories.create({
      data: {
        ...createCategoryDto,
        slug,
      },
    });

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAll() {
    const categories = await this.prisma.categories.findMany();

    return {
      message: 'All categories list',
      data: categories,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: `Category with id #${id}`,
      data: category,
    };
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const existing = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const data: any = { ...updateCategoryDto };

    if (updateCategoryDto.name) {
      data.slug = slugify(updateCategoryDto.name, { lower: true });
    }

    const category = await this.prisma.categories.update({
      where: { id },
      data,
    });

    return {
      message: `Category #${id} updated successfully`,
      data: category,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const category = await this.prisma.categories.delete({
      where: { id },
    });

    return {
      message: `Category #${id} deleted successfully`,
      data: category,
    };
  }
}
