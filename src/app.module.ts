import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminsModule } from './admins/admins.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { OrderStatusesModule } from './order-statuses/order-statuses.module';
import { ProductsModule } from './products/products.module';
import { ProductSubtypesModule } from './product-subtypes/product-subtypes.module';

@Module({
  imports: [AdminsModule, CategoriesModule, OrdersModule, OrderItemsModule, OrderStatusesModule, ProductsModule, ProductSubtypesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
