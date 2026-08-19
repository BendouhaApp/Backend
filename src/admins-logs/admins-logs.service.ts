import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAction, AdminEntity, Prisma } from '@prisma/client';

export interface LogActionParams {
  adminId: string;
  action: AdminAction;
  entity: AdminEntity;
  entityId: string;
  description?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AdminsLogsService {
  private readonly logger = new Logger(AdminsLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an admin action with rich structured metadata.
   * Wrapped in try/catch to ensure audit logging never breaks main business flows.
   */
  async log(params: LogActionParams) {
    return this.logAction(
      params.adminId,
      params.action,
      params.entity,
      params.entityId,
      params.description,
      params.metadata,
    );
  }

  async logAction(
    adminId: string,
    action: AdminAction,
    entity: AdminEntity,
    entityId: string,
    description?: string,
    metadata?: Record<string, any>,
  ) {
    try {
      if (!adminId || adminId === 'system') {
        const systemAdmin = await this.prisma.staff_accounts.findFirst({
          where: { active: true },
          select: { id: true },
        });
        if (systemAdmin) {
          adminId = systemAdmin.id;
        } else {
          return null;
        }
      }

      return await this.prisma.admins_logs.create({
        data: {
          admin_id: adminId,
          action,
          entity,
          entity_id: String(entityId),
          description: description || null,
          metadata: metadata ?? Prisma.JsonNull,
        },
      });
    } catch (err: any) {
      this.logger.error(
        `Failed to record admin log [${action} ${entity} #${entityId}]: ${err?.message || err}`,
      );
      return null;
    }
  }

  /**
   * Returns aggregated high-level activity metrics for dashboard & analytics.
   */
  async getActivitySummary(days: number = 30) {
    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const logs = await this.prisma.admins_logs.findMany({
        where: {
          created_at: { gte: sinceDate },
        },
        include: {
          staff_accounts: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              roles: {
                select: {
                  role_name: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      let totalProductsCreated = 0;
      let totalStockUnitsAdded = 0;
      let totalOrdersConfirmed = 0;
      let totalOrderConfirmedRevenue = 0;
      let totalLogins = 0;

      const adminStatsMap = new Map<
        string,
        {
          admin_id: string;
          username: string;
          name: string;
          role: string;
          total_actions: number;
          products_created: number;
          stock_added: number;
          orders_confirmed: number;
        }
      >();

      for (const log of logs) {
        const adminId = log.admin_id;
        const adminName =
          `${log.staff_accounts?.first_name || ''} ${log.staff_accounts?.last_name || ''}`.trim() ||
          log.staff_accounts?.username ||
          'Unknown';
        const roleName = log.staff_accounts?.roles?.role_name || 'STAFF';

        if (!adminStatsMap.has(adminId)) {
          adminStatsMap.set(adminId, {
            admin_id: adminId,
            username: log.staff_accounts?.username || 'unknown',
            name: adminName,
            role: roleName,
            total_actions: 0,
            products_created: 0,
            stock_added: 0,
            orders_confirmed: 0,
          });
        }

        const stats = adminStatsMap.get(adminId)!;
        stats.total_actions += 1;

        const meta = (log.metadata as Record<string, any>) || {};

        if (log.action === AdminAction.CREATE && log.entity === AdminEntity.PRODUCT) {
          totalProductsCreated += 1;
          stats.products_created += 1;
        }

        if (meta.quantity_added && Number(meta.quantity_added) > 0) {
          const qty = Number(meta.quantity_added);
          totalStockUnitsAdded += qty;
          stats.stock_added += qty;
        }

        if (log.action === AdminAction.CONFIRM && log.entity === AdminEntity.ORDER) {
          totalOrdersConfirmed += 1;
          stats.orders_confirmed += 1;
          if (meta.total_price) {
            totalOrderConfirmedRevenue += Number(meta.total_price) || 0;
          }
        }

        if (log.action === AdminAction.LOGIN) {
          totalLogins += 1;
        }
      }

      const recentHighlights = logs
        .filter(
          (l) =>
            l.entity === AdminEntity.PRODUCT ||
            l.entity === AdminEntity.ORDER ||
            l.entity === AdminEntity.ROLE,
        )
        .slice(0, 10)
        .map((l) => ({
          id: l.id,
          action: l.action,
          entity: l.entity,
          entity_id: l.entity_id,
          description: l.description,
          metadata: l.metadata,
          created_at: l.created_at,
          admin: {
            id: l.staff_accounts?.id,
            username: l.staff_accounts?.username,
            name: `${l.staff_accounts?.first_name || ''} ${l.staff_accounts?.last_name || ''}`.trim(),
          },
        }));

      return {
        period_days: days,
        totals: {
          total_actions: logs.length,
          products_created: totalProductsCreated,
          stock_units_added: totalStockUnitsAdded,
          orders_confirmed: totalOrdersConfirmed,
          orders_confirmed_revenue: totalOrderConfirmedRevenue,
          logins: totalLogins,
        },
        admin_performance: Array.from(adminStatsMap.values()).sort(
          (a, b) => b.total_actions - a.total_actions,
        ),
        recent_highlights: recentHighlights,
      };
    } catch (err: any) {
      this.logger.error(
        `Failed to calculate activity summary: ${err?.message || err}`,
      );
      return {
        period_days: days,
        totals: {
          total_actions: 0,
          products_created: 0,
          stock_units_added: 0,
          orders_confirmed: 0,
          orders_confirmed_revenue: 0,
          logins: 0,
        },
        admin_performance: [],
        recent_highlights: [],
      };
    }
  }

  /**
   * Returns specific activity stats and profile metrics for a single admin.
   */
  async getAdminSummary(adminId: string, days?: number) {
    const admin = await this.prisma.staff_accounts.findUnique({
      where: { id: adminId },
      include: {
        roles: {
          select: {
            id: true,
            role_name: true,
            permissions: true,
          },
        },
      },
    });

    if (!admin) {
      return null;
    }

    const whereClause: any = { admin_id: adminId };
    if (days && days > 0) {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);
      whereClause.created_at = { gte: sinceDate };
    }

    const [totalActions, logs] = await Promise.all([
      this.prisma.admins_logs.count({ where: whereClause }),
      this.prisma.admins_logs.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: 100,
      }),
    ]);

    let productsCreated = 0;
    let productsUpdated = 0;
    let ordersConfirmed = 0;
    let ordersConfirmedRevenue = 0;
    let stockUnitsAdded = 0;
    let categoriesManaged = 0;
    let loginsCount = 0;

    for (const log of logs) {
      const meta = (log.metadata as Record<string, any>) || {};

      if (log.entity === AdminEntity.PRODUCT) {
        if (log.action === AdminAction.CREATE) {
          productsCreated += 1;
          const qty = Number(meta.quantity_added || meta.quantity || 0);
          if (qty > 0) stockUnitsAdded += qty;
        } else if (log.action === AdminAction.UPDATE) {
          productsUpdated += 1;
          if (meta.stock_change?.diff && Number(meta.stock_change.diff) > 0) {
            stockUnitsAdded += Number(meta.stock_change.diff);
          }
        }
      }

      if (log.entity === AdminEntity.ORDER) {
        if (
          log.action === AdminAction.CONFIRM ||
          (log.action === AdminAction.UPDATE &&
            (meta.new_status === 'CONFIRMED' || meta.new_status === 'APPROVED' || meta.status === 'CONFIRMED'))
        ) {
          ordersConfirmed += 1;
          if (meta.total_price) {
            ordersConfirmedRevenue += Number(meta.total_price || 0);
          }
        }
      }

      if (log.entity === AdminEntity.CATEGORY) {
        categoriesManaged += 1;
      }

      if (log.action === AdminAction.LOGIN) {
        loginsCount += 1;
      }
    }

    return {
      admin: {
        id: admin.id,
        username: admin.username,
        first_name: admin.first_name,
        last_name: admin.last_name,
        phone_number: admin.phone_number,
        active: admin.active,
        role: admin.roles?.role_name || 'STAFF',
        role_id: admin.role_id,
        permissions: admin.roles?.permissions || [],
        created_at: admin.created_at,
        last_login_at: admin.last_login_at,
      },
      metrics: {
        total_actions: totalActions,
        products_created: productsCreated,
        products_updated: productsUpdated,
        orders_confirmed: ordersConfirmed,
        orders_confirmed_revenue: ordersConfirmedRevenue,
        stock_units_added: stockUnitsAdded,
        categories_managed: categoriesManaged,
        logins_count: loginsCount,
      },
      recent_logs: logs.slice(0, 10),
    };
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
    adminId,
  }: {
    page: number;
    limit: number;
    search?: string;
    actions?: string[];
    entities?: string[];
    date?: string;
    from?: string;
    to?: string;
    adminId?: string;
  }) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};

    if (adminId?.trim()) {
      where.admin_id = adminId.trim();
    }

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
              roles: {
                select: {
                  id: true,
                  role_name: true,
                },
              },
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
            first_name: true,
            last_name: true,
            roles: {
              select: {
                id: true,
                role_name: true,
              },
            },
          },
        },
      },
    });
  }
}
