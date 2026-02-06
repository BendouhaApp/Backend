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

  async findAll({ page, limit }: { page: number; limit: number }) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      this.prisma.admins_logs.findMany({
        skip,
        take: safeLimit,
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
      }),
      this.prisma.admins_logs.count(),
    ]);

    return {
      data: items,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
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
