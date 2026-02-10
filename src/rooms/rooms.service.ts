import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import {
  ROOM_OBSTACLES,
  ROOM_TYPES,
  type RoomTypeKey,
} from './rooms.types';
import { SimulateRoomDto } from './dto/simulate-room.dto';
import { PrismaService } from '../prisma/prisma.service';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const degToRad = (deg: number) => (deg * Math.PI) / 180;

@Injectable()
export class RoomsService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  private normalizeRoomType(type: string): RoomTypeKey {
    const normalized = type.toLowerCase().replace(/\s+/g, '_');
    const allowedTypes = ROOM_TYPES.map((room) => room.key);
    if (!allowedTypes.includes(normalized as RoomTypeKey)) {
      throw new BadRequestException('Invalid room type');
    }
    return normalized as RoomTypeKey;
  }

  getRoomTypes() {
    return {
      message: 'Room types',
      data: ROOM_TYPES,
    };
  }

  async getRoomTemplates() {
    const stored = await this.getStoredRooms();
    if (stored.data.length > 0) {
      return { ...stored, message: 'Room templates' };
    }

    const templates = ROOM_TYPES.map((type) => ({
      ...type,
      obstacles: ROOM_OBSTACLES[type.key],
    }));

    return {
      message: 'Room templates',
      data: templates,
    };
  }

  async getStoredRooms() {
    if (!this.prisma) {
      return { message: 'Room templates (database)', data: [] };
    }

    try {
      const rooms = await this.prisma.rooms.findMany({
        include: {
          obstacles: true,
        },
        orderBy: { created_at: 'asc' },
      });

      const mapped = rooms.map((room) => ({
        key: room.room_type,
        label: room.label,
        description: room.description ?? '',
        defaultDimensions: {
          width: Number(room.width),
          length: Number(room.length),
          height: Number(room.height),
          unit: room.unit === 'm' ? 'm' : 'm',
        },
        obstacles: room.obstacles.map((obstacle) => ({
          id: obstacle.obstacle_id,
          label: obstacle.label,
          category: obstacle.category,
          width: Number(obstacle.width),
          height: Number(obstacle.height),
          depth: Number(obstacle.depth),
          placement: {
            x: Number(obstacle.placement_x),
            z: Number(obstacle.placement_z),
          },
          blocksLight: obstacle.blocks_light ?? false,
        })),
      }));

      return { message: 'Room templates (database)', data: mapped };
    } catch {
      return { message: 'Room templates (database)', data: [] };
    }
  }

  getObstacles(type?: string) {
    if (!type) {
      return {
        message: 'Room obstacles',
        data: ROOM_OBSTACLES,
      };
    }

    const normalized = this.normalizeRoomType(type);

    return {
      message: 'Room obstacles',
      data: ROOM_OBSTACLES[normalized],
    };
  }

  simulate(dto: SimulateRoomDto) {
    const roomType = this.normalizeRoomType(dto.roomType);
    const roomTemplate = ROOM_TYPES.find((room) => room.key === roomType);
    const defaults = roomTemplate?.defaultDimensions;

    if (!defaults) {
      throw new BadRequestException('Room template not found');
    }

    const width = clamp(dto.dimensions?.width ?? defaults.width, 1, 20);
    const length = clamp(dto.dimensions?.length ?? defaults.length, 1, 20);
    const height = clamp(dto.dimensions?.height ?? defaults.height, 1, 8);

    const roomArea = width * length;

    const availableObstacles = ROOM_OBSTACLES[roomType] ?? [];
    const selectedObstacleIds =
      dto.obstacles && dto.obstacles.length > 0
        ? dto.obstacles
            .map((id) => id.trim())
            .filter((id) => availableObstacles.some((o) => o.id === id))
        : availableObstacles.map((o) => o.id);

    const selectedObstacles = availableObstacles.filter((o) =>
      selectedObstacleIds.includes(o.id),
    );

    const blockingArea = selectedObstacles
      .filter((o) => o.blocksLight)
      .reduce((sum, obstacle) => sum + obstacle.width * obstacle.depth, 0);

    const coverage = roomArea > 0 ? blockingArea / roomArea : 0;
    const blockageFactor = clamp(coverage * 0.6, 0, 0.45);

    const effectiveLumen = Math.max(0, dto.product.lumen * (1 - blockageFactor));
    const estimatedLux = roomArea > 0 ? effectiveLumen / roomArea : null;
    const beamDiameter =
      dto.product.angle && height
        ? 2 * height * Math.tan(degToRad(dto.product.angle / 2))
        : null;
    const efficacy =
      dto.product.power > 0 ? dto.product.lumen / dto.product.power : null;

    const warnings: string[] = [];
    if (dto.product.cri < 80) {
      warnings.push('low_cri');
    }
    if (dto.product.cct < 2700 || dto.product.cct > 6500) {
      warnings.push('cct_outside_range');
    }
    if (estimatedLux !== null && estimatedLux < 100) {
      warnings.push('low_lux');
    }
    if (estimatedLux !== null && estimatedLux > 1200) {
      warnings.push('high_lux');
    }

    return {
      message: 'Simulation result',
      data: {
        roomType,
        dimensions: {
          width,
          length,
          height,
          unit: 'm',
        },
        obstacleIds: selectedObstacleIds,
        blockageFactor,
        effectiveLumen,
        estimatedLux,
        beamDiameter,
        efficacy,
        warnings,
        safetyNotes: roomTemplate?.safetyNotes ?? [],
      },
    };
  }
}
