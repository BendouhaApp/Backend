import { Module } from '@nestjs/common';
import { OrderStatusesService } from './order-statuses.service';
import { OrderStatusesController } from './order-statuses.controller';

@Module({
  controllers: [OrderStatusesController],
  providers: [OrderStatusesService],
})
export class OrderStatusesModule {}
