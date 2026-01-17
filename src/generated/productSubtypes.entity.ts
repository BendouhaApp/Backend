
import {ApiProperty} from '@nestjs/swagger'
import {Categories} from './categories.entity'
import {Products} from './products.entity'


export class ProductSubtypes {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
name: string ;
slug: string ;
description: string  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
category_id: number  | null;
is_active: boolean  | null;
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
categories?: Categories  | null;
products?: Products[] ;
}
