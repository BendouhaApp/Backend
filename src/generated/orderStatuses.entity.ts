
import {ApiProperty} from '@nestjs/swagger'
import {Orders} from './orders.entity'


export class OrderStatuses {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
name: string ;
description: string  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
sort_order: number  | null;
orders?: Orders[] ;
}
