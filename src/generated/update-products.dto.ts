
import {Prisma} from '../../generated/prisma'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateProductsDto {
  @ApiProperty({
  type: 'string',
  required: false,
})
name?: string ;
@ApiProperty({
  type: 'string',
  required: false,
})
slug?: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
description?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
short_description?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
})
sku?: string ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
})
price?: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
  nullable: true,
})
cost_price?: Prisma.Decimal  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
stock_quantity?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 10,
  required: false,
  nullable: true,
})
low_stock_threshold?: number  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
brand?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
model_number?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
voltage?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
wattage?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
power_consumption?: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
warranty_months?: number  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
image_url?: string  | null;
@ApiProperty({
  type: 'boolean',
  default: true,
  required: false,
  nullable: true,
})
is_active?: boolean  | null;
@ApiProperty({
  type: 'boolean',
  default: false,
  required: false,
  nullable: true,
})
is_featured?: boolean  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
  nullable: true,
})
weight?: Prisma.Decimal  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
dimensions?: string  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  default: new Date().toISOString(),
  required: false,
  nullable: true,
})
created_at?: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  default: new Date().toISOString(),
  required: false,
  nullable: true,
})
updated_at?: Date  | null;
}
