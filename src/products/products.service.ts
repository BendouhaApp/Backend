import { Injectable , NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
     const product = await this.prisma.products.create({
      data: createProductDto,
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

  async findOne(id: number) {
    const product = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!product) { throw new NotFoundException('Product not found'); }

    return {
      message: 'Product with id ' + id,
      data: product,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
    })

    if (!existing) { throw new NotFoundException('Product not found'); }

    const product = await this.prisma.products.update({
      where: { id }, 
      data: updateProductDto, 
    });

    return {
      message: `Product #${id} updated successfully`,
      data: product,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
    })

    if (!existing) { throw new NotFoundException('Product not found'); }

    const product = await this.prisma.products.delete({
      where: { id },
    });

    return {
      message: `Product #${id} deleted successfully`,
      data: product,
    };
  }
}
