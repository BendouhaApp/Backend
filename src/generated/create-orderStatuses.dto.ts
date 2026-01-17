
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateOrderStatusesDto {
  name: string;
description?: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
  default: 0,
})
sort_order?: number;
}
