import { IsString, IsInt, Min } from 'class-validator';

export class CreateCartItemsDto {
  @IsString()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
