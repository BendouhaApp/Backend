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

  async findAll({
    page,
    limit,
    search,
    actions,
    entities,
    date,
    from,
    to,
  }: {
    page: number;
    limit: number;
    search?: string;
    actions?: string[];
    entities?: string[];
    date?: string;
    from?: string;
    to?: string;
  }) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};

    if (search?.trim()) {
      const term = search.trim();
      const termLower = term.toLowerCase();

      const or: any[] = [
        { entity_id: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];

      or.push(
        {
          staff_accounts: {
            is: {
              username: { contains: term, mode: 'insensitive' },
            },
          },
        },
        {
          staff_accounts: {
            is: {
              first_name: { contains: term, mode: 'insensitive' },
            },
          },
        },
        {
          staff_accounts: {
            is: {
              last_name: { contains: term, mode: 'insensitive' },
            },
          },
        },
      );

      const matchingActions = Object.values(AdminAction).filter((a) =>
        a.toLowerCase().includes(termLower),
      );
      if (matchingActions.length) {
        or.push({ action: { in: matchingActions } });
      }

      const matchingEntities = Object.values(AdminEntity).filter((e) =>
        e.toLowerCase().includes(termLower),
      );
      if (matchingEntities.length) {
        or.push({ entity: { in: matchingEntities } });
      }

      where.OR = or;
    }

    if (actions?.length) where.action = { in: actions };
    if (entities?.length) where.entity = { in: entities };

    // Date filtering
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        where.created_at = {
          gte: fromDate,
          lte: toDate,
        };
      }
    } else if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      where.created_at = {
        gte: start,
        lte: end,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.admins_logs.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { created_at: 'desc' },
        include: {
          staff_accounts: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
      this.prisma.admins_logs.count({ where }),
    ]);

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const statsWhere: any = {
      ...where,
      created_at: {
        ...(where.created_at ?? {}),
        gte: yesterday,
      },
    };

    const [last24hCount, actionCounts] = await Promise.all([
      this.prisma.admins_logs.count({ where: statsWhere }),

      this.prisma.admins_logs.groupBy({
        by: ['action'],
        where,
        _count: {
          action: true,
        },
      }),
    ]);

    const actionCountsObj = Object.fromEntries(
      actionCounts.map((a) => [a.action, a._count.action]),
    );

    return {
      data: items,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
      stats: {
        last24h: last24hCount,
        actionCounts: actionCountsObj,
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
