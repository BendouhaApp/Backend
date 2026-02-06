import { Controller, Get, Param, UseGuards , Query } from '@nestjs/common';
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
  ) {
    return this.logsService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    example: 'uuid-admin-log-id',
  })
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(id);
  }
}
