import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { PermissionsGuard } from '../admin-auth/permissions.guard';
import { RequirePermissions } from '../admin-auth/require-permissions.decorator';

@ApiTags('admins')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@RequirePermissions('admins:manage')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @ApiOperation({ summary: 'Create a new admin account' })
  @Post()
  create(@Body() dto: CreateAdminDto, @Req() req: any) {
    return this.adminsService.create(dto, req.user?.id);
  }

  @ApiOperation({ summary: 'Get all admin accounts' })
  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @ApiOperation({ summary: 'Get admin account by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update admin account' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @Req() req: any,
  ) {
    return this.adminsService.update(id, dto, req.user?.id);
  }

  @ApiOperation({ summary: 'Delete admin account' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.adminsService.remove(id, req.user?.id);
  }
}
