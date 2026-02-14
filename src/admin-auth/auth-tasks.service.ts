import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdminAuthService } from '../admin-auth/admin-auth.service';

@Injectable()
export class AuthTasksService {
  private readonly logger = new Logger(AuthTasksService.name);

  constructor(private readonly authService: AdminAuthService) {}

  //Clean up expired or revoked refresh tokens it runs every day at 1:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    timeZone: 'Africa/Algiers',
  })
  async cleanupExpiredTokens() {
    this.logger.log('Starting cleanup of expired refresh tokens...');

    try {
      await this.authService.cleanupExpiredTokens();
      this.logger.log('Token cleanup completed successfully');
    } catch (error) {
      this.logger.error('Token cleanup failed', error);
    }
  }
}
