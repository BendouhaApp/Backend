import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WilayasService } from './wilayas.service';

@ApiTags('Wilayas')
@Controller('wilayas')
export class WilayasController {
  constructor(private readonly service: WilayasService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
