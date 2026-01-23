import { Controller, Get, Delete, Query } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Query('user_id') user_id?: number) {
    return this.cartService.getCart(user_id);
  }

  @Delete()
  clearCart(@Query('user_id') user_id?: number) {
    return this.cartService.clearCart(user_id);
  }
}
