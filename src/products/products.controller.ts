import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import * as fs from 'fs';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private static uploadDir = './uploads/products';

  private static multerConfig = {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        if (!fs.existsSync(ProductsController.uploadDir)) {
          fs.mkdirSync(ProductsController.uploadDir, { recursive: true });
        }
        cb(null, ProductsController.uploadDir);
      },
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  };

  @UseGuards(AdminJwtGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      ProductsController.multerConfig,
    ),
  )
  create(@Req() req: any) {
    const files = req.files as {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    };

    return this.productsService.create(
      {
        ...req.body,
        thumbnail: files?.thumbnail?.[0]
          ? `/uploads/products/${files.thumbnail[0].filename}`
          : null,
        images: files?.images
          ? files.images.map((f) => `/uploads/products/${f.filename}`)
          : [],
      },
      req.user.id,
    );
  }

  @UseGuards(AdminJwtGuard)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      ProductsController.multerConfig,
    ),
  )
  update(@Param('id') id: string, @Req() req: any) {
    const files = req.files as {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    };

    const removedImages = req.body.removed_images
      ? Array.isArray(req.body.removed_images)
        ? req.body.removed_images
        : [req.body.removed_images]
      : [];

    return this.productsService.update(
      id,
      {
        ...req.body,
        removed_images: removedImages,
        thumbnail: files?.thumbnail?.[0]
          ? `/uploads/products/${files.thumbnail[0].filename}`
          : undefined,
        images: files?.images
          ? files.images.map((f) => `/uploads/products/${f.filename}`)
          : undefined,
      },
      req.user.id,
    );
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productsService.remove(id, req.user.id);
  }

  @Get('public')
  async findPublic(@Res({ passthrough: true }) res: Response) {
    const products = await this.productsService.findPublic();
    return { data: products };
  }

  @Get('public/:id')
  async findPublicOne(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const product = await this.productsService.findPublicOne(id);
    return { data: product };
  }

  @UseGuards(AdminJwtGuard)
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @UseGuards(AdminJwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}