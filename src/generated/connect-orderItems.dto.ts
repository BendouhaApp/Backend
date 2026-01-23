
import {ApiProperty} from '@nestjs/swagger'




export class ConnectOrderItemsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
}
