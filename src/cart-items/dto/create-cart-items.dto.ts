import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateCartItemsDto {
  @IsString()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  dimension?: string;
}
