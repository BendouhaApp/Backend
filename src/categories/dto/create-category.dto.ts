import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNotEmpty, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {

  @ApiProperty({
    example: 'Wall lamp',
    description: 'Category name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Wall lamps for home',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Parent category ID',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  parent_id?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Is category active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;
}