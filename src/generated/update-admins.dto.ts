
import {ApiProperty} from '@nestjs/swagger'




export class UpdateAdminsDto {
  username?: string;
email?: string;
password_hash?: string;
full_name?: string;
@ApiProperty({
  default: true,
})
is_active?: boolean;
@ApiProperty({
  type: `string`,
  format: `date-time`,
  default: `now`,
})
created_at?: Date;
@ApiProperty({
  type: `string`,
  format: `date-time`,
  default: `now`,
})
updated_at?: Date;
}
