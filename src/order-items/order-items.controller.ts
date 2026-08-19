import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { PermissionsGuard } from '../admin-auth/permissions.guard';
import { RequirePermissions } from '../admin-auth/require-permissions.decorator';

@ApiTags('order-items')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@RequirePermissions('orders:update')
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  create(@Body() dto: CreateOrderItemDto) {
    return this.orderItemsService.create(dto);
  }

  @Get('order/:order_id')
  @ApiParam({
    name: 'order_id',
    example: 'ORD-1700000000000',
  })
  findByOrder(@Param('order_id') order_id: string) {
    return this.orderItemsService.findByOrder(order_id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    example: 'uuid-order-item-id',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.orderItemsService.update(id, dto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    example: 'uuid-order-item-id',
  })
  remove(@Param('id') id: string) {
    return this.orderItemsService.remove(id);
  }
}
