import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { WilayasService } from './wilayas.service';

@ApiTags('Wilayas')
@Controller('wilayas')
export class WilayasController {
  constructor(private readonly service: WilayasService) {}

  @Get()
  findAll(@Res({ passthrough: true }) res: Response) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
    );
    res.setHeader('Vary', 'Accept-Encoding');

    return this.service.findAll();
  }
}
