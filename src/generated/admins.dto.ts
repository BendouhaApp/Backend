
import {ApiProperty} from '@nestjs/swagger'


export class AdminsDto {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
username: string ;
email: string ;
password_hash: string ;
full_name: string  | null;
is_active: boolean  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
created_at: Date  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updated_at: Date  | null;
}
