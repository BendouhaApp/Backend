import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminsLogsModule } from '../admins-logs/admins-logs.module';

@Module({
  imports: [
    PrismaModule,
    AdminsLogsModule,  
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
