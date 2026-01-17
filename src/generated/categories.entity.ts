
import {ApiProperty} from '@nestjs/swagger'
import {ProductSubtypes} from './productSubtypes.entity'
import {Products} from './products.entity'


export class Categories {
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
parent_id: number  | null;
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
other_categories?: Categories[] ;
product_subtypes?: ProductSubtypes[] ;
products?: Products[] ;
}
