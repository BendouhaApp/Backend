import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    example: 'uuid-order-status-id',
    description: 'Order status ID',
  })
  @IsOptional()
  @IsString()
  order_status_id?: string;
}
