import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AdminsLogsService } from '../admins-logs/admins-logs.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PrismaService,
    AdminsLogsService,
  ],
})
export class OrdersModule {}
