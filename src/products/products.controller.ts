import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags , ApiOperation , ApiParam } from '@nestjs/swagger'
 
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new product'
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Find all products'
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Find product by id'
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update product by id'
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete product by id'
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
