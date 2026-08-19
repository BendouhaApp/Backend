import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  IsInt,
  MaxLength,
} from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username?: string;

  @ApiPropertyOptional({
    example: 'NewSecurePassword123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    example: 'John',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string;

  @ApiPropertyOptional({
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @ApiPropertyOptional({
    example: '0555123456',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  phone_number?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Role ID',
  })
  @IsOptional()
  @IsInt()
  role_id?: number;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
