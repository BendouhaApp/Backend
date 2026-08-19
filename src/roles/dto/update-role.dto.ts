import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ArrayUnique,
} from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'INVENTORY_MANAGER',
    description: 'Unique name/identifier of the role',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  role_name?: string;

  @ApiPropertyOptional({
    example: 'Manages products, categories, and inventory stocks',
    description: 'Human-readable description of the role',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    example: ['products:read', 'products:create', 'products:update'],
    description: 'List of granular permission keys granted to this role',
  })
  @IsOptional()
  @IsArray({ message: 'permissions must be an array of strings' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  @ArrayUnique({ message: 'Permissions array must not contain duplicate keys' })
  permissions?: string[];
}
