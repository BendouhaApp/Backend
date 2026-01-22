import { Injectable } from '@nestjs/common';
import { CreateProductSubtypeDto } from './dto/create-product-subtype.dto';
import { UpdateProductSubtypeDto } from './dto/update-product-subtype.dto';

@Injectable()
export class ProductSubtypesService {
  create(createProductSubtypeDto: CreateProductSubtypeDto) {
    return 'This action adds a new productSubtype';
  }

  findAll() {
    return `This action returns all productSubtypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productSubtype`;
  }

  update(id: number, updateProductSubtypeDto: UpdateProductSubtypeDto) {
    return `This action updates a #${id} productSubtype`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSubtype`;
  }
}
