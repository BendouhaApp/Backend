import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { UpdateCartItemsDto } from './dto/update-cart-items.dto';

@Controller('cart/items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  add(
    @Query('cart_id', ParseIntPipe) cart_id: number,
    @Body() dto: CreateCartItemsDto,
  ) {
    return this.cartItemsService.addToCart(cart_id, dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemsDto,
  ) {
    return this.cartItemsService.updateItem(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cartItemsService.removeItem(id);
  }
}
