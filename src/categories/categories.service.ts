import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { CreateCategoryDto } from '../dtos/category/create.dto';
import { UpdateCategoryDto } from '../dtos/category/update.dto';
import { generateRandomString } from '../utils/generate-random-string';
import { generateSlug } from '../utils/generate-slug';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly _categoriesRepository: CategoriesRepository) {}

  async getAll(): Promise<Array<Category>> {
    const where: Prisma.CategoryWhereInput = {
      deletedAt: {
        equals: null,
      },
    };
    return this._categoriesRepository.getAllCategories({
      where,
    });
  }

  async getById(id: string): Promise<Category | null> {
    const where: Prisma.CategoryWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    return this._categoriesRepository.getOneCategory({
      where,
    });
  }

  async create(payload: CreateCategoryDto): Promise<Category> {
    const categories = await this.getAll();
    const existSlugs = new Set(categories.map((category) => category.slug));

    const originalSlug = generateSlug(payload.name);
    let slug = originalSlug;
    while (existSlugs.has(slug)) {
      slug = `${originalSlug}-${generateRandomString(8)}`;
    }

    const data: Prisma.CategoryCreateInput = {
      ...payload,
      slug,
    };
    return this._categoriesRepository.createCategory({
      data,
    });
  }

  async update(id: string, payload: UpdateCategoryDto): Promise<Category> {
    const where: Prisma.CategoryWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    return this._categoriesRepository.updateCategory({
      where,
      data: payload,
    });
  }

  async delete(id: string): Promise<Category> {
    const where: Prisma.CategoryWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    const data = {
      deletedAt: new Date(),
    };
    return this._categoriesRepository.updateCategory({
      where,
      data,
    });
  }
}
