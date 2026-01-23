
import {ApiProperty} from '@nestjs/swagger'
import {Orders} from './orders.entity'


export class OrderStatuses {
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
  nullable: true,
})
description: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
sort_order: number  | null;
@ApiProperty({
  type: () => Orders,
  isArray: true,
  required: false,
})
orders?: Orders[] ;
}
