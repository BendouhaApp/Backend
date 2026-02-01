import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: 'uuid-customer-id',
  })
  @IsOptional()
  @IsString()
  customer_id?: string;

  @ApiPropertyOptional({
    example: 'uuid-coupon-id',
  })
  @IsOptional()
  @IsString()
  coupon_id?: string;

  @ApiPropertyOptional({
    example: 'uuid-order-status-id',
  })
  @IsOptional()
  @IsString()
  order_status_id?: string;
}
