
import {ApiProperty} from '@nestjs/swagger'




export class CreateOrderStatusesDto {
  @ApiProperty({
  type: 'string',
})
name: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
description?: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
sort_order?: number  | null;
}
