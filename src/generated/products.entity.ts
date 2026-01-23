
import {Prisma} from '../../generated/prisma'
import {ApiProperty} from '@nestjs/swagger'
import {OrderItems} from './orderItems.entity'
import {Categories} from './categories.entity'
import {ProductSubtypes} from './productSubtypes.entity'


export class Products {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
name: string ;
@ApiProperty({
  type: 'string',
})
slug: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
description: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
short_description: string  | null;
@ApiProperty({
  type: 'string',
})
sku: string ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
})
price: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  nullable: true,
})
cost_price: Prisma.Decimal  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
stock_quantity: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
low_stock_threshold: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
category_id: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
subtype_id: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
brand: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
model_number: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
voltage: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
wattage: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
power_consumption: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
warranty_months: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
image_url: string  | null;
@ApiProperty({
  type: 'boolean',
  nullable: true,
})
is_active: boolean  | null;
@ApiProperty({
  type: 'boolean',
  nullable: true,
})
is_featured: boolean  | null;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  nullable: true,
})
weight: Prisma.Decimal  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
dimensions: string  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
created_at: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
updated_at: Date  | null;
@ApiProperty({
  type: () => OrderItems,
  isArray: true,
  required: false,
})
order_items?: OrderItems[] ;
@ApiProperty({
  type: () => Categories,
  required: false,
  nullable: true,
})
categories?: Categories  | null;
@ApiProperty({
  type: () => ProductSubtypes,
  required: false,
  nullable: true,
})
product_subtypes?: ProductSubtypes  | null;
}
