
import {ApiProperty} from '@nestjs/swagger'


export class AdminsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
username: string ;
@ApiProperty({
  type: 'string',
})
email: string ;
@ApiProperty({
  type: 'string',
})
password_hash: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
full_name: string  | null;
@ApiProperty({
  type: 'boolean',
  nullable: true,
})
is_active: boolean  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
created_at: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
updated_at: Date  | null;
}
