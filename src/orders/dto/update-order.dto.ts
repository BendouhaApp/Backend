import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description: 'Order status',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
