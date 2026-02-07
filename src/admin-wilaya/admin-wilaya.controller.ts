import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard'
import { AdminWilayaService } from './admin-wilaya.service'
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto'
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto'

@ApiTags('Admin Shipping Zones')
@UseGuards(AdminJwtGuard)
@Controller('admin/shipping-zones')
export class AdminWilayaController {
  constructor(private readonly service: AdminWilayaService) {}

  @Get()
  getAll() {
    return this.service.getAll()
  }

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreateShippingZoneDto,
  ) {
    return this.service.create(dto, req.user.id)
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShippingZoneDto,
  ) {
    return this.service.update(id, dto, req.user.id) 
  }

  @Delete(':id')
  remove(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(id, req.user.id)
  }
}
