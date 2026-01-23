import { PartialType } from '@nestjs/swagger';
import { CreateCartItemsDto } from './create-cart-items.dto';

export class UpdateCartItemsDto extends PartialType(CreateCartItemsDto) {}
