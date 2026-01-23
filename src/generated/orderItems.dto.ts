
import {Prisma} from '../../generated/prisma'
import {ApiProperty} from '@nestjs/swagger'


export class OrderItemsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
product_name: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
product_sku: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
quantity: number ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
})
unit_price: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
})
total_price: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
created_at: Date  | null;
}
