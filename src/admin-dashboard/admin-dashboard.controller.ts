import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AdminDashboardService } from './admin-dashboard.service'
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard'

@ApiTags('Admin Dashboard')
@UseGuards(AdminJwtGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get()
  getStats() {
    return this.service.getStats()
  }

  @Get('recent-orders')
  getRecentOrders() {
    return this.service.getRecentOrders()
  }
}
