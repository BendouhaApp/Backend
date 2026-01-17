
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Orders} from './orders.entity'
import {Products} from './products.entity'


export class OrderItems {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
order_id: number ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
product_id: number  | null;
product_name: string ;
product_sku: string  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
quantity: number ;
@ApiProperty({
  type: `number`,
  format: `double`,
})
unit_price: Prisma.Decimal ;
@ApiProperty({
  type: `number`,
  format: `double`,
})
total_price: Prisma.Decimal ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
created_at: Date  | null;
orders?: Orders ;
products?: Products  | null;
}
