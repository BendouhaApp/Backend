import { Module } from '@nestjs/common';
import { AdminsLogsService } from './admins-logs.service';
import { AdminsLogsController } from './admins-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminsLogsController],
  providers: [AdminsLogsService],
  exports: [AdminsLogsService],
})
export class AdminsLogsModule {}
