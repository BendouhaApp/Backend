import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminsLogsService } from './admins-logs.service';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';

@UseGuards(AdminJwtGuard)
@Controller('admins-logs')
export class AdminsLogsController {
  constructor(private readonly logsService: AdminsLogsService) {}

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(Number(id));
  }
}
