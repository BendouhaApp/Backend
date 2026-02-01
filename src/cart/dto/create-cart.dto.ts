import { IsOptional, IsString } from 'class-validator';

export class CreateCartDto {
  @IsOptional()
  @IsString()
  customer_id?: string;
}
