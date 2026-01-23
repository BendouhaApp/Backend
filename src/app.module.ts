import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AdminsModule, CategoriesModule, OrdersModule, OrderItemsModule, ProductsModule],
})
export class AppModule {}
