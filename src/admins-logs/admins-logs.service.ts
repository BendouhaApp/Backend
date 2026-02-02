import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAction, AdminEntity } from '@prisma/client';

@Injectable()
export class AdminsLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    adminId: string;
    action: AdminAction;
    entity: AdminEntity;
    entityId: string;
    description?: string;
    metadata?: any;
  }) {
    return this.prisma.admins_logs.create({
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
    return this.prisma.admins_logs.findMany({
      include: {
        staff_accounts: {
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

  async findOne(id: string) {
    return this.prisma.admins_logs.findUnique({
      where: { id },
      include: {
        staff_accounts: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}
