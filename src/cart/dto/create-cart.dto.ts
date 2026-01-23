import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  user_id?: number;
}
