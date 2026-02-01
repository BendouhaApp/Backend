import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsPositive, IsString, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 'ORD-1700000000000',
    description: 'Order ID',
  })
  @IsString()
  order_id: string;

  @ApiPropertyOptional({
    example: 'uuid-product-id',
    description: 'Product ID',
  })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of product',
  })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    example: 10.99,
    description: 'Product price',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;
}
