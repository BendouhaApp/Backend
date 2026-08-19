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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { PermissionsGuard } from '../admin-auth/permissions.guard';
import { RequirePermissions } from '../admin-auth/require-permissions.decorator';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@RequirePermissions('admins:manage')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'List all available system permissions' })
  @Get('permissions')
  getPermissions() {
    return this.rolesService.getAvailablePermissions();
  }

  @ApiOperation({ summary: 'Get all roles with admin counts' })
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @ApiOperation({ summary: 'Get role by ID with assigned admins' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new role' })
  @Post()
  create(@Body() dto: CreateRoleDto, @Req() req: any) {
    return this.rolesService.create(dto, req.user?.id);
  }

  @ApiOperation({ summary: 'Update an existing role' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @Req() req: any,
  ) {
    return this.rolesService.update(id, dto, req.user?.id);
  }

  @ApiOperation({ summary: 'Delete a role (non-system only)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.rolesService.remove(id, req.user?.id);
  }
}
