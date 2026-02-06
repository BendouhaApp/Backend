import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Query('cart_id') cart_id: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(cart_id, dto);
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin')
  findAllAdmin(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.ordersService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @UseGuards(AdminJwtGuard)
  @Get('statuses')
  getStatuses() {
    return this.ordersService.getStatuses();
  }

  @UseGuards(AdminJwtGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.update(id, dto, req.user.id);
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.remove(id, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
