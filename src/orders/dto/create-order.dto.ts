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

  @ApiProperty({
    example: 102,
    description: 'Commune ID related to the selected wilaya',
  })
  @Type(() => Number)
  @IsInt()
  commune_id: number;

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

  @ApiPropertyOptional({
    example: 'fb.1.1558571054389.1098115397',
    description: 'Facebook Browser ID cookie (_fbp)',
  })
  @IsOptional()
  @IsString()
  fbp?: string;

  @ApiPropertyOptional({
    example: 'fb.1.1554386783.AbCdEfGhIjKlMnOpQrStUvWxYz',
    description: 'Facebook Click ID cookie (_fbc)',
  })
  @IsOptional()
  @IsString()
  fbc?: string;

  @ApiPropertyOptional({
    example: 'Chrome/5.0 ...',
    description: 'Client User Agent for CAPI matching',
  })
  @IsOptional()
  @IsString()
  client_user_agent?: string;

  @ApiPropertyOptional({
    example: '105.101.42.18',
    description: 'Client IP address for CAPI matching',
  })
  @IsOptional()
  @IsString()
  client_ip_address?: string;

  @ApiPropertyOptional({
    example: 'https://bendouha.com/checkout',
    description: 'Event source URL for CAPI',
  })
  @IsOptional()
  @IsString()
  event_source_url?: string;
}
