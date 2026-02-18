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
import { ApiTags, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(AdminJwtGuard)
  @Get('admin')
  findAllAdmin() {
    return this.categoriesService.findAllAdmin();
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/:id')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  findOneAdmin(@Param('id') id: string) {
    return this.categoriesService.findOneAdmin(id);
  }

  @UseGuards(AdminJwtGuard)
  @Post()
  create(@Body() dto: CreateCategoryDto, @Req() req: any) {
    return this.categoriesService.create(dto, req.user.id);
  }

  @UseGuards(AdminJwtGuard)
  @Patch(':id')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: any,
  ) {
    return this.categoriesService.update(id, dto, req.user.id);
  }

  @UseGuards(AdminJwtGuard)
  @Patch(':id/activate')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  activate(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.activate(id, req.user.id);
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  @ApiParam({ name: 'id', example: 'uuid-category-id' })
  disable(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.remove(id, req.user.id);
  }

  @Get()
  findAll(@Res({ passthrough: true }) res: Response) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600',
    );
    res.setHeader('Vary', 'Accept-Encoding');

    return this.categoriesService.findAll();
  }

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
