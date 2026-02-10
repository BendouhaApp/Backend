import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WilayasController } from './wilayas.controller';
import { WilayasService } from './wilayas.service';

@Module({
  imports: [PrismaModule],
  controllers: [WilayasController],
  providers: [WilayasService],
})
export class WilayasModule {}
