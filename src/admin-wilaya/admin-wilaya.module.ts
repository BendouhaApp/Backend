import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminsLogsModule } from '../admins-logs/admins-logs.module';
import { AdminWilayaController } from './admin-wilaya.controller';
import { AdminWilayaService } from './admin-wilaya.service';

@Module({
  imports: [PrismaModule, AdminsLogsModule],
  controllers: [AdminWilayaController],
  providers: [AdminWilayaService],
})
export class AdminWilayaModule {}
