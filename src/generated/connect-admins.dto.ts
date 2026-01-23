
import {ApiProperty} from '@nestjs/swagger'




export class ConnectAdminsDto {
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
username?: string ;
@ApiProperty({
  type: 'string',
  required: false,
})
email?: string ;
}
