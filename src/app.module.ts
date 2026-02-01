import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminsModule } from './admins/admins.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { CartModule } from './cart/cart.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { AdminsLogsModule } from './admins-logs/admins-logs.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 5
    }]),

    PrismaModule,
    AdminsModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    CartItemsModule,
    OrdersModule,
    OrderItemsModule,
    AdminsLogsModule,
    AdminAuthModule,
  ],
})
export class AppModule {}
