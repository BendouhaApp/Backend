import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateMetaPixelDto {
  @ApiPropertyOptional({
    example: '123456789012345',
    description: 'Meta (Facebook) Pixel ID (10-20 numeric digits)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,20}$/, {
    message: 'metaPixelId must be a numeric string between 10 and 20 digits',
  })
  metaPixelId?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether client-side Meta Pixel tracking is enabled',
  })
  @IsOptional()
  @IsBoolean()
  metaPixelEnabled?: boolean;

  @ApiPropertyOptional({
    example: 'EAAG...xyz',
    description: 'Meta Conversions API (CAPI) System User Access Token',
  })
  @IsOptional()
  @IsString()
  metaCapiToken?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether server-side Meta Conversions API (CAPI) is enabled',
  })
  @IsOptional()
  @IsBoolean()
  metaCapiEnabled?: boolean;

  @ApiPropertyOptional({
    example: 'TEST12345',
    description: 'Meta Test Event Code for real-time Events Manager debugging',
  })
  @IsOptional()
  @IsString()
  metaTestEventCode?: string | null;

  // Snake_case aliases for client convenience
  @ApiPropertyOptional({
    example: '123456789012345',
    description: 'Meta (Facebook) Pixel ID (snake_case alias, 10-20 numeric digits)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,20}$/, {
    message: 'meta_pixel_id must be a numeric string between 10 and 20 digits',
  })
  meta_pixel_id?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether client-side Meta Pixel tracking is enabled (snake_case alias)',
  })
  @IsOptional()
  @IsBoolean()
  meta_pixel_enabled?: boolean;

  @ApiPropertyOptional({
    example: 'EAAG...xyz',
    description: 'Meta Conversions API Token (snake_case alias)',
  })
  @IsOptional()
  @IsString()
  meta_capi_token?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether server-side Meta CAPI is enabled (snake_case alias)',
  })
  @IsOptional()
  @IsBoolean()
  meta_capi_enabled?: boolean;

  @ApiPropertyOptional({
    example: 'TEST12345',
    description: 'Meta Test Event Code (snake_case alias)',
  })
  @IsOptional()
  @IsString()
  meta_test_event_code?: string | null;
}
