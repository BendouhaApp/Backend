import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { MetaCapiService } from './meta-capi.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController],
  providers: [SettingsService, MetaCapiService],
  exports: [SettingsService, MetaCapiService],
})
export class SettingsModule {}
