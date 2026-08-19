import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ArrayUnique,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'INVENTORY_MANAGER',
    description: 'Unique name/identifier of the role',
  })
  @IsString()
  @IsNotEmpty({ message: 'role_name is required' })
  @MaxLength(255)
  role_name: string;

  @ApiPropertyOptional({
    example: 'Manages products, categories, and inventory stocks',
    description: 'Human-readable description of the role',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: ['products:read', 'products:create', 'products:update'],
    description: 'List of granular permission keys granted to this role',
  })
  @IsArray({ message: 'permissions must be an array of strings' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  @ArrayUnique({ message: 'Permissions array must not contain duplicate keys' })
  permissions: string[];
}
