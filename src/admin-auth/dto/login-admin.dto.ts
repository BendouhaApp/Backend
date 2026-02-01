import { IsString, IsNotEmpty } from 'class-validator';

export class LoginAdminDto {
  @IsString()
  @IsNotEmpty()
  user: string; // can be username but in db schema is email..

  @IsString()
  @IsNotEmpty()
  password: string;
}
