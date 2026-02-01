import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AdminJwtGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ) {
    return this.productsService.create(
      createProductDto,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Find all products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find product by id' })
  @ApiParam({
    name: 'id',
    example: 'uuid-v4',
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(AdminJwtGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update product by id' })
  @ApiParam({
    name: 'id',
    example: 'uuid-v4',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productsService.update(
      id,
      updateProductDto,
      req.user.id,
    );
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiParam({
    name: 'id',
    example: 'uuid-v4',
  })
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.productsService.remove(
      id,
      req.user.id,
    );
  }
}
