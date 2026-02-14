import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCategories,
      mainCategories,
      subCategories,
      totalRevenueAgg,
      confirmedOrders,
      totalWilayas,
      activeWilayas,
      inactiveWilayas,
    ] = await Promise.all([
      
      this.prisma.orders.count(),
      this.prisma.orders.count({
        where: {
          created_at: {
            gte: startOfToday,
          },
        },
      }),

      this.prisma.orders.count({
        where: {
          order_statuses: {
            status_name: {
              equals: 'Pending',
              mode: 'insensitive',
            },
          },
        },
      }),

      this.prisma.products.count(),
      this.prisma.products.count({ where: { published: true } }),
      this.prisma.products.count({ where: { published: false } }),
      this.prisma.products.count({ where: { quantity: 0 } }),
      this.prisma.products.count({
        where: { quantity: { gt: 0, lte: 10 } },
      }),

      this.prisma.categories.count(),
      this.prisma.categories.count({ where: { parent_id: null } }),
      this.prisma.categories.count({ where: { parent_id: { not: null } } }),

      this.prisma.order_items.findMany({
        where: {
          orders: {
            order_statuses: {
              status_name: {
                equals: 'Confirmed',
                mode: 'insensitive',
              },
            },
          },
        },
        select: {
          price: true,
          quantity: true,
        },
      }),

      this.prisma.orders.count({
        where: {
          order_statuses: {
            status_name: {
              equals: 'Confirmed',
              mode: 'insensitive',
            },
          },
        },
      }),

      this.prisma.shipping_zones.count(),
      this.prisma.shipping_zones.count({ where: { active: true } }),
      this.prisma.shipping_zones.count({ where: { active: false } }),
    ]);

    const totalRevenue = totalRevenueAgg.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return {
      totalOrders,
      todayOrders,
      pendingOrders,
      totalProducts,
      confirmedOrders,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCategories,
      mainCategories,
      subCategories,
      totalRevenue,
      totalWilayas,
      activeWilayas,
      inactiveWilayas,
    };
  }

  async getRecentOrders() {
    const orders = await this.prisma.orders.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        created_at: true,
        customer_first_name: true,
        customer_last_name: true,
        customer_phone: true,
        customers: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        order_statuses: {
          select: {
            status_name: true,
            color: true,
          },
        },
        order_items: {
          select: {
            id: true,
            price: true,
            quantity: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      created_at: order.created_at.toISOString(),
      customer_first_name: order.customer_first_name,
      customer_last_name: order.customer_last_name,
      customer_phone: order.customer_phone,
      customers: order.customers,
      order_statuses: order.order_statuses,
      order_items: order.order_items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
      })),
    }));
  }
}
