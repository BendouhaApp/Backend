import { ApiProperty , ApiPropertyOptional  } from "@nestjs/swagger";
import { IsString, IsOptional, IsInt, IsNotEmpty, IsBoolean } from 'class-validator';
import { Type } from "class-transformer"

export class CreateCategoryDto {
      @ApiProperty({
        example: 'Wall lapm',
        description: "categorie name"
      })
      @IsString()
      @IsNotEmpty()
      name: string;

      @ApiPropertyOptional({
        example: 'wall lapm for home',
        description: 'categorie descripton'
      })
      @IsOptional()
      @IsString()
      description?: string;

      @ApiPropertyOptional({
        example: 1,
        description: 'parent categorie id'
      })
      @IsOptional()
      @IsInt()
      @Type(() => Number)
      parent_id?: number;

      @ApiPropertyOptional({
        example: true,
        description: 'is categorie active',
        default: true
      })
      @IsOptional()
      @IsBoolean()
      @Type(() => Boolean)
      is_active?: boolean;

    
}
