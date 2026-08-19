import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { PermissionsGuard } from '../admin-auth/permissions.guard';
import { RequirePermissions } from '../admin-auth/require-permissions.decorator';
import { ApiTags, ApiParam, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Admin list all categories' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('categories:read')
  @Get('admin')
  findAllAdmin() {
    return this.categoriesService.findAllAdmin();
  }

  @ApiOperation({ summary: 'Admin get category details' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('categories:read')
  @Get('admin/:id')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  findOneAdmin(@Param('id') id: string) {
    return this.categoriesService.findOneAdmin(id);
  }

  @ApiOperation({ summary: 'Create a new category' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('categories:create')
  @Post()
  create(@Body() dto: CreateCategoryDto, @Req() req: any) {
    return this.categoriesService.create(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Update an existing category' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('categories:update')
  @Patch(':id')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: any,
  ) {
    return this.categoriesService.update(id, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Toggle category active status' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('categories:update')
  @Patch(':id/activate')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  activate(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.activate(id, req.user.id);
  }

  @ApiOperation({ summary: 'Delete or disable category' })
  @ApiBearerAuth()
  @UseGuards(AdminJwtGuard, PermissionsGuard)
  @RequirePermissions('categories:delete')
  @Delete(':id')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  disable(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Public list published categories' })
  @Get()
  findAll(@Res({ passthrough: true }) res: Response) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600',
    );
    res.setHeader('Vary', 'Accept-Encoding');

    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Public get category details' })
  @Get(':id')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  findOne(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600',
    );
    res.setHeader('Vary', 'Accept-Encoding');

    return this.categoriesService.findOne(id);
  }
}
