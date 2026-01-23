
import {Prisma} from '../../generated/prisma'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateOrderItemsDto {
  @ApiProperty({
  type: 'string',
  required: false,
})
product_name?: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
product_sku?: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
quantity?: number ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
})
unit_price?: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
})
total_price?: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  default: new Date().toISOString(),
  required: false,
  nullable: true,
})
created_at?: Date  | null;
}
