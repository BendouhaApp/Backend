import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAction, AdminEntity } from '@prisma/client';

@Injectable()
export class AdminsLogsService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    adminId: number;
    action: AdminAction;
    entity: AdminEntity;
    entityId: number;
    description?: string;
    metadata?: any;
  }) {
    return this.prisma.adminLog.create({
      data: {
        admin_id: params.adminId,
        action: params.action,
        entity: params.entity,
        entity_id: params.entityId,
        description: params.description,
        metadata: params.metadata,
      },
    });
  }

  async findAll() {
    return this.prisma.adminLog.findMany({
      include: {
        admin: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.adminLog.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}
