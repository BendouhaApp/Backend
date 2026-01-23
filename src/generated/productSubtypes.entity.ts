
import {ApiProperty} from '@nestjs/swagger'
import {Categories} from './categories.entity'
import {Products} from './products.entity'


export class ProductSubtypes {
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
category_id: number  | null;
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
  type: () => Products,
  isArray: true,
  required: false,
})
products?: Products[] ;
}
