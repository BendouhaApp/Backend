import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { RoomsService } from './rooms.service';
import { SimulateRoomDto } from './dto/simulate-room.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('types')
  getTypes(@Res({ passthrough: true }) res: Response) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
    );
    res.setHeader('Vary', 'Accept-Encoding');

    return this.roomsService.getRoomTypes();
  }

  @Get('templates')
  getTemplates(@Res({ passthrough: true }) res: Response) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
    );
    res.setHeader('Vary', 'Accept-Encoding');

    return this.roomsService.getRoomTemplates();
  }

  @Get('stored')
  getStoredTemplates() {
    return this.roomsService.getStoredRooms();
  }

  @Get('obstacles')
  @ApiQuery({
    name: 'type',
    required: false,
    example: 'bedroom',
    description: 'Optional room type key to filter obstacles',
  })
  getObstacles(
    @Query('type') type?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    res?.setHeader(
      'Cache-Control',
      'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
    );
    res?.setHeader('Vary', 'Accept-Encoding');

    return this.roomsService.getObstacles(type);
  }

  @Post('simulate')
  simulate(@Body() dto: SimulateRoomDto) {
    return this.roomsService.simulate(dto);
  }
}
