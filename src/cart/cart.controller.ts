import { Controller, Get, Delete, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Query('customer_id') customer_id?: string) {
    return this.cartService.getCart(customer_id);
  }

  @Delete()
  clearCart(@Query('customer_id') customer_id?: string) {
    return this.cartService.clearCart(customer_id);
  }
}
