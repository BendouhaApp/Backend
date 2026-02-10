import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { AdminsLogsService } from './admins-logs.service';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('logs')
@UseGuards(AdminJwtGuard)
@Controller('admins-logs')
export class AdminsLogsController {
  constructor(private readonly logsService: AdminsLogsService) {}

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
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 'uuid-admin-log-id' })
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(id);
  }
}
