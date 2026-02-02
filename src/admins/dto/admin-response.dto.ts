import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class AdminResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Admin ID' })
  id: string;

  @ApiProperty({ example: 'admin', description: 'Admin username' })
  username: string;

  @ApiProperty({ example: true, description: 'Is admin active' })
  active: boolean;

  @ApiProperty({ example: '2026-01-23T19:00:00.000Z' })
  created_at: Date;

  @Exclude()
  password_hash: string;

  constructor(partial: Partial<AdminResponseDto>) {
    Object.assign(this, partial);
  }
}
