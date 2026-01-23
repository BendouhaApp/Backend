import { ApiProperty , ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsInt , IsPositive , IsNumber} from 'class-validator';
import { Type } from "class-transformer";

export class CreateOrderItemDto {
    @ApiProperty({
        example: 1,
        description: 'order id'
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    order_id: number;

    @ApiPropertyOptional({
        example: 1,
        description: 'prodect id'
    })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    product_id?: number;

    @ApiProperty({
        example: 2,
        description: 'quantity of products'
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    quantity: number;

    @ApiProperty({
        example: 10.99,
        description: 'price per unit'
    })
    @IsPositive()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Type(() => Number)
    unit_price: number;


}

