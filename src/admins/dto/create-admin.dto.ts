import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  MinLength,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Unique login username for the admin',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(100)
  username: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (minimum 8 characters)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100)
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100)
  last_name: string;

  @ApiPropertyOptional({
    example: '0555123456',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  phone_number?: string;

  @ApiProperty({
    example: 1,
    description: 'Assigned Role ID',
  })
  @IsInt({ message: 'role_id must be an integer' })
  @IsNotEmpty({ message: 'role_id is required' })
  role_id: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Account active status',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
