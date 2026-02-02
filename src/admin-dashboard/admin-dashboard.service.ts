import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      revenue,
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

      this.prisma.order_items.aggregate({
        _sum: {
          price: true,
        },
      }),
    ])

    return {
      totalOrders,
      pendingOrders,
      totalProducts,
      totalRevenue: revenue._sum.price ?? 0,
    }
  }

  async getRecentOrders() {
    const orders = await this.prisma.orders.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        created_at: true,
        order_statuses: {
          select: {
            status_name: true,
          },
        },
        order_items: {
          select: {
            price: true,
            quantity: true,
          },
        },
      },
    })

    return orders.map(order => ({
      order_id: order.id,
      status: order.order_statuses?.status_name ?? 'unknown',
      total_price: order.order_items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      ),
    }))
  }
}
