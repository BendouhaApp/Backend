import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({
    example: 'admin_user',
    description: 'Admin username',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @ApiPropertyOptional({
    example: 'NewSecurePassword123!',
    description: 'New admin password',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is admin active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
