
import {Prisma} from '../../generated/prisma'
import {ApiProperty} from '@nestjs/swagger'
import {Orders} from './orders.entity'
import {Products} from './products.entity'


export class OrderItems {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
order_id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
product_id: number  | null;
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
@ApiProperty({
  type: () => Orders,
  required: false,
})
orders?: Orders ;
@ApiProperty({
  type: () => Products,
  required: false,
  nullable: true,
})
products?: Products  | null;
}
