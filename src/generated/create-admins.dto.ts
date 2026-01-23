
import {ApiProperty} from '@nestjs/swagger'




export class CreateAdminsDto {
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
  required: false,
  nullable: true,
})
full_name?: string  | null;
@ApiProperty({
  type: 'boolean',
  default: true,
  required: false,
  nullable: true,
})
is_active?: boolean  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  default: new Date().toISOString(),
  required: false,
  nullable: true,
})
created_at?: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  default: new Date().toISOString(),
  required: false,
  nullable: true,
})
updated_at?: Date  | null;
}
