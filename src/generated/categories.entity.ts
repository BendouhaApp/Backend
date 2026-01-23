
import {ApiProperty} from '@nestjs/swagger'
import {ProductSubtypes} from './productSubtypes.entity'
import {Products} from './products.entity'


export class Categories {
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
  type: 'integer',
  format: 'int32',
  nullable: true,
})
parent_id: number  | null;
@ApiProperty({
  type: 'boolean',
  nullable: true,
})
is_active: boolean  | null;
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
  type: () => Categories,
  required: false,
  nullable: true,
})
categories?: Categories  | null;
@ApiProperty({
  type: () => Categories,
  isArray: true,
  required: false,
})
other_categories?: Categories[] ;
@ApiProperty({
  type: () => ProductSubtypes,
  isArray: true,
  required: false,
})
product_subtypes?: ProductSubtypes[] ;
@ApiProperty({
  type: () => Products,
  isArray: true,
  required: false,
})
products?: Products[] ;
}
