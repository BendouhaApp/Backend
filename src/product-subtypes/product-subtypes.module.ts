import { Module } from '@nestjs/common';
import { ProductSubtypesService } from './product-subtypes.service';
import { ProductSubtypesController } from './product-subtypes.controller';

@Module({
  controllers: [ProductSubtypesController],
  providers: [ProductSubtypesService],
})
export class ProductSubtypesModule {}
