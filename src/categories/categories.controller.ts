import { Controller , Get , Post , Body , Patch , Param , Delete , ParseIntPipe , UseGuards , Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';

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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(AdminJwtGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
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
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.categoriesService.remove(
      id,
      req.user.id,
    );
  }
}

