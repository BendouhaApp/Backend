import { IsString, IsOptional, IsNotEmpty, IsInt, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({
    example: 'Ahmed',
  })
  @IsNotEmpty()
  @IsString()
  customer_first_name: string;

  @ApiProperty({
    example: 'Benali',
  })
  @IsNotEmpty()
  @IsString()
  customer_last_name: string;

  @ApiProperty({
    example: '+213551234567',
  })
  @IsNotEmpty()
  @IsString()
  customer_phone: string;

  @ApiProperty({
    example: 16,
    description: 'Shipping zone (wilaya) ID',
  })
  @Type(() => Number)
  @IsInt()
  wilaya_id: number;

  @ApiPropertyOptional({
    example: 'home',
    description: 'Delivery type: home or office',
  })
  @IsOptional()
  @IsIn(['home', 'office'])
  delivery_type?: 'home' | 'office';

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
