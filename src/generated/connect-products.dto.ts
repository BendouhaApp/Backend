
import {ApiProperty} from '@nestjs/swagger'




export class ConnectProductsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
id?: number ;
@ApiProperty({
  type: 'string',
  required: false,
})
slug?: string ;
@ApiProperty({
  type: 'string',
  required: false,
})
sku?: string ;
}
