import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { PermissionsGuard } from '../admin-auth/permissions.guard';
import { RequirePermissions } from '../admin-auth/require-permissions.decorator';
import { SettingsService } from './settings.service';
import { UpdateMetaPixelDto } from './dto/update-meta-pixel.dto';

@ApiTags('Settings')
@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get Meta Pixel settings for admin dashboard' })
  @Get('admin/settings/meta-pixel')
  getAdminMetaPixel() {
    return this.settingsService.getMetaPixelSettings();
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('marketing:update')
  @ApiOperation({ summary: 'Update Meta Pixel settings via PATCH' })
  @Patch('admin/settings/meta-pixel')
  patchAdminMetaPixel(@Body() dto: UpdateMetaPixelDto, @Req() req: any) {
    return this.settingsService.updateMetaPixelSettings(dto, req?.user?.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('marketing:update')
  @ApiOperation({ summary: 'Update Meta Pixel settings via POST' })
  @Post('admin/settings/meta-pixel')
  postAdminMetaPixel(@Body() dto: UpdateMetaPixelDto, @Req() req: any) {
    return this.settingsService.updateMetaPixelSettings(dto, req?.user?.id);
  }

  // Public Endpoint (For storefront pixel injection)
  @ApiOperation({ summary: 'Get public Meta Pixel ID for tracking injection' })
  @Get('settings/meta-pixel')
  getPublicMetaPixel(@Res({ passthrough: true }) res: Response) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=30, s-maxage=60, stale-while-revalidate=60',
    );
    res.setHeader('Vary', 'Accept-Encoding');

    return this.settingsService.getPublicMetaPixel();
  }
}
