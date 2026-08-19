import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminsLogsService } from './admins-logs.service';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { PermissionsGuard } from '../admin-auth/permissions.guard';
import { RequirePermissions } from '../admin-auth/require-permissions.decorator';
import { ApiTags, ApiParam, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('logs')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admins-logs')
export class AdminsLogsController {
  constructor(private readonly logsService: AdminsLogsService) {}

  @ApiOperation({ summary: 'Get high-level admin activity and operational metrics' })
  @RequirePermissions('logs:read')
  @Get('activity-summary')
  getActivitySummary(@Query('days') days = '30') {
    return this.logsService.getActivitySummary(Math.max(1, Number(days) || 30));
  }

  @ApiOperation({ summary: 'Get dedicated activity profile & statistics for a specific admin' })
  @RequirePermissions('logs:read')
  @Get('summary/:adminId')
  @ApiParam({ name: 'adminId', example: 'uuid-admin-id' })
  async getAdminSummary(
    @Param('adminId', new ParseUUIDPipe({ version: '4' })) adminId: string,
    @Query('days') days?: string,
  ) {
    const summary = await this.logsService.getAdminSummary(
      adminId,
      days ? Number(days) : undefined,
    );
    if (!summary) {
      throw new NotFoundException(`Admin #${adminId} not found`);
    }
    return summary;
  }

  @ApiOperation({ summary: 'List and filter paginated audit action logs' })
  @RequirePermissions('logs:read')
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('date') date?: string,
    @Query('adminId') adminId?: string,
  ) {
    return this.logsService.findAll({
      page: Math.max(1, Number(page)),
      limit: Math.min(100, Math.max(1, Number(limit))),
      search: search?.trim(),
      actions: action ? action.split(',').filter(Boolean) : undefined,
      entities: entity ? entity.split(',').filter(Boolean) : undefined,
      date,
      from,
      to,
      adminId,
    });
  }

  @ApiOperation({ summary: 'Get audit log details by ID' })
  @RequirePermissions('logs:read')
  @Get(':id')
  @ApiParam({ name: 'id', example: 'uuid-admin-log-id' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.logsService.findOne(id);
  }
}
