
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateProductsDto {
  name?: string;
slug?: string;
description?: string;
short_description?: string;
sku?: string;
@ApiProperty({
  type: `number`,
  format: `double`,
})
price?: Prisma.Decimal;
@ApiProperty({
  type: `number`,
  format: `double`,
})
cost_price?: Prisma.Decimal;
@ApiProperty({
  type: `integer`,
  format: `int32`,
  default: 0,
})
stock_quantity?: number;
@ApiProperty({
  type: `integer`,
  format: `int32`,
  default: 10,
})
low_stock_threshold?: number;
brand?: string;
model_number?: string;
voltage?: string;
wattage?: string;
power_consumption?: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
warranty_months?: number;
image_url?: string;
@ApiProperty({
  default: true,
})
is_active?: boolean;
@ApiProperty({
  default: false,
})
is_featured?: boolean;
@ApiProperty({
  type: `number`,
  format: `double`,
})
weight?: Prisma.Decimal;
dimensions?: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
  default: `now`,
})
created_at?: Date;
@ApiProperty({
  type: `string`,
  format: `date-time`,
  default: `now`,
})
updated_at?: Date;
}
