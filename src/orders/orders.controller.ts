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
import { PermissionsGuard } from '../admin-auth/permissions.guard';
import { RequirePermissions } from '../admin-auth/require-permissions.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Public create order from cart' })
  @Post()
  create(
    @Query('cart_id') cart_id: string,
    @Body() dto: CreateOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.create(cart_id, dto, req);
  }

  @ApiOperation({ summary: 'Admin list paginated orders' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('orders:read')
  @Get('admin')
  findAllAdmin(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.ordersService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @ApiOperation({ summary: 'Get all order statuses' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('orders:read')
  @Get('statuses')
  getStatuses() {
    return this.ordersService.getStatuses();
  }

  @ApiOperation({ summary: 'Update or confirm order status' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('orders:update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.update(id, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Delete or cancel order' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('orders:delete')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Public tracking of order by ID and phone' })
  @Get(':id')
  findOne(@Param('id') id: string, @Query('phone') phone: string) {
    return this.ordersService.findOne(id, phone);
  }

  @ApiOperation({ summary: 'Admin get full order details by ID' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('orders:read')
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.ordersService.findOneAdmin(id);
  }
}
