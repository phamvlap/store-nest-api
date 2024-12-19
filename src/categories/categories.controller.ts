import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import {
  CreateCategoryDto,
  createCategorySchema,
} from '../dtos/category/create.dto';
import {
  UpdateCategoryDto,
  updateCategorySchema,
} from '../dtos/category/update.dto';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Get()
  async getAll(): Promise<Array<Category>> {
    return this._categoriesService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Category | null> {
    return this._categoriesService.getById(id);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryDto,
  ): Promise<Category> {
    return this._categoriesService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryDto,
  ): Promise<Category> {
    return this._categoriesService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Category> {
    return this._categoriesService.delete(id);
  }
}
