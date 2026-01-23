import { IsString, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Led Lapm'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'led-lamp'
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'LED-001'
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({
    example: 1200
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'https://example.com/image.png', required: false
 })
  @IsUrl()
  image_url?: string;
}
