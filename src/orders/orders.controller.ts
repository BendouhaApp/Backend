import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe , UseGuards , Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Query('cart_id', ParseIntPipe) cart_id: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(cart_id, dto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(AdminJwtGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.update(id, dto, req.user.id);
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.ordersService.remove(id, req.user.id);
  }
}

