import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class AdminResponseDto {
  @ApiProperty({ example: 1, description: 'Admin ID' })
  id: number;

  @ApiProperty({ example: 'admin_user', description: 'Admin username' })
  username: string;

  @Exclude()
  password_hash: string;

  @ApiProperty({ example: true, description: 'Is admin active' })
  is_active: boolean;

  @ApiProperty({ example: '2026-01-23T19:00:00.000Z', description: 'Creation date' })
  created_at: Date;

  constructor(partial: Partial<AdminResponseDto>) {
    Object.assign(this, partial);
  }
}