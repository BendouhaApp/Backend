import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Wall lamp',
    description: 'Category name',
  })
  @IsString()
  @IsNotEmpty()
  category_name: string;

  @ApiPropertyOptional({
    example: 'Wall lamps for home',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  category_description?: string;

  @ApiPropertyOptional({
    example: 'uuid-parent-category-id',
    description: 'Parent category ID',
  })
  @IsOptional()
  @IsString()
  parent_id?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is category active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    example: '/uploads/categories/lighting.jpg',
    description: 'Main category image',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
