import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartItemsDto {
  @IsInt()
  @Type(() => Number)
  product_id: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
