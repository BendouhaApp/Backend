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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(AdminJwtGuard)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: any,
  ) {
    return this.categoriesService.create(
      createCategoryDto,
      req.user.id,
    );
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    example: 'uuid-category-id',
  })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(AdminJwtGuard)
  @Patch(':id')
  @ApiParam({
    name: 'id',
    example: 'uuid-category-id',
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: any,
  ) {
    return this.categoriesService.update(
      id,
      updateCategoryDto,
      req.user.id,
    );
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  @ApiParam({
    name: 'id',
    example: 'uuid-category-id',
  })
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.categoriesService.remove(
      id,
      req.user.id,
    );
  }
}
