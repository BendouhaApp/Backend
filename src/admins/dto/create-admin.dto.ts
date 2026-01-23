import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ 
    example: 'admin_user', 
    description: 'Admin username',
    minLength: 3
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ 
    example: 'admin@bendouha.com', 
    description: 'Admin email address' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'SecurePassword123!', 
    description: 'Admin password',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: true, 
    description: 'Is admin account active',
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}