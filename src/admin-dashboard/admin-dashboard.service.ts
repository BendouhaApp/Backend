import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCategories,
      mainCategories,
      subCategories,
      orderItems,
    ] = await Promise.all([
      
      this.prisma.orders.count(),

      this.prisma.orders.count({
        where: {
          order_statuses: {
            status_name: 'pending',
          },
        },
      }),

      this.prisma.products.count(),

      this.prisma.products.count({
        where: { published: true },
      }),

      this.prisma.products.count({
        where: { published: false },
      }),

      this.prisma.products.count({
        where: { quantity: 0 },
      }),

      this.prisma.products.count({
        where: {
          quantity: { gt: 0, lte: 10 },
        },
      }),

      this.prisma.categories.count(),

      this.prisma.categories.count({
        where: { parent_id: null },
      }),

      this.prisma.categories.count({
        where: { parent_id: { not: null } },
      }),

      this.prisma.order_items.findMany({
        select: {
          price: true,
          quantity: true,
        },
      }),
    ]);

    const totalRevenue = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return {
      totalOrders,
      pendingOrders,
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCategories,
      mainCategories,
      subCategories,
      totalRevenue,
    };
  }

  async getRecentOrders() {
    const orders = await this.prisma.orders.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        created_at: true,
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
