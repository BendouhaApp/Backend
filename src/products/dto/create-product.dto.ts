import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'led-lamp' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'LED Lamp' })
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @ApiProperty({ example: 'LED-001', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  sale_price: number;

  @ApiProperty({ example: 1500, required: false })
  @IsNumber()
  @IsOptional()
  compare_price?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  buying_price?: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'Short description here' })
  @IsString()
  @IsNotEmpty()
  short_description: string;

  @ApiProperty({ example: 'Full product description here' })
  @IsString()
  @IsNotEmpty()
  product_description: string;

  @ApiProperty({ example: 'physical', required: false })
  @IsString()
  @IsOptional()
  product_type?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  disable_out_of_stock?: boolean;

  @ApiProperty({ example: 'Internal note', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
