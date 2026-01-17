
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class OrderItemsDto {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
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
}
