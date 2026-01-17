import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSubtypesService } from './product-subtypes.service';
import { CreateProductSubtypeDto } from './dto/create-product-subtype.dto';
import { UpdateProductSubtypeDto } from './dto/update-product-subtype.dto';

@Controller('product-subtypes')
export class ProductSubtypesController {
  constructor(private readonly productSubtypesService: ProductSubtypesService) {}

  @Post()
  create(@Body() createProductSubtypeDto: CreateProductSubtypeDto) {
    return this.productSubtypesService.create(createProductSubtypeDto);
  }

  @Get()
  findAll() {
    return this.productSubtypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSubtypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductSubtypeDto: UpdateProductSubtypeDto) {
    return this.productSubtypesService.update(+id, updateProductSubtypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSubtypesService.remove(+id);
  }
}
