
import {ApiProperty} from '@nestjs/swagger'


export class OrderStatusesDto {
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
}
