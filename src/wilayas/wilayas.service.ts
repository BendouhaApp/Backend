import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WilayasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.shipping_zones.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });
    return { data };
  }
}
