import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { UpdateCartItemsDto } from './dto/update-cart-items.dto';
import { ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Cart Items')
@Controller('cart/items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  add(
    @Query('cart_id') cart_id: string,
    @Body() dto: CreateCartItemsDto,
  ) {
    return this.cartItemsService.addToCart(cart_id, dto);
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    example: 'uuid-card-item-id',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemsDto,
  ) {
    return this.cartItemsService.updateItem(id, dto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    example: 'uuid-card-item-id',
  })
  remove(@Param('id') id: string) {
    return this.cartItemsService.removeItem(id);
  }
}
