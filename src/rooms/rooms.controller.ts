import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { SimulateRoomDto } from './dto/simulate-room.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('types')
  getTypes() {
    return this.roomsService.getRoomTypes();
  }

  @Get('templates')
  getTemplates() {
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
  getObstacles(@Query('type') type?: string) {
    return this.roomsService.getObstacles(type);
  }

  @Post('simulate')
  simulate(@Body() dto: SimulateRoomDto) {
    return this.roomsService.simulate(dto);
  }
}
