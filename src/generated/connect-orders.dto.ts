
import {ApiProperty} from '@nestjs/swagger'




export class ConnectOrdersDto {
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
order_number?: string ;
}
