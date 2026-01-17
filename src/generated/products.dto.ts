
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class ProductsDto {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
name: string ;
slug: string ;
description: string  | null;
short_description: string  | null;
sku: string ;
@ApiProperty({
  type: `number`,
  format: `double`,
})
price: Prisma.Decimal ;
@ApiProperty({
  type: `number`,
  format: `double`,
})
cost_price: Prisma.Decimal  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
stock_quantity: number  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
low_stock_threshold: number  | null;
brand: string  | null;
model_number: string  | null;
voltage: string  | null;
wattage: string  | null;
power_consumption: string  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
warranty_months: number  | null;
image_url: string  | null;
is_active: boolean  | null;
is_featured: boolean  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
weight: Prisma.Decimal  | null;
dimensions: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
created_at: Date  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updated_at: Date  | null;
}
