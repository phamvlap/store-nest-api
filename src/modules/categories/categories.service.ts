import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { generateRandomString } from '../../common/utils/generate-random-string';
import { generateSlug } from '../../common/utils/generate-slug';
import { CATEGORY_NOT_FOUND } from '../../contents/errors/category.error';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dtos/create.dto';
import { UpdateCategoryDto } from './dtos/update.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly _categoriesRepository: CategoriesRepository) {}

  async getAll(): Promise<Array<Category>> {
    const where: Prisma.CategoryWhereInput = {
      deletedAt: {
        equals: null,
      },
    };
    const categories = await this._categoriesRepository.getAllCategories({
      where,
    });
    return categories;
  }

  async getById(id: string): Promise<Category | null> {
    const where: Prisma.CategoryWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    const category = await this._categoriesRepository.getOneCategory({
      where,
    });
    if (!category) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }
    return category;
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
    const category = await this._categoriesRepository.createCategory({
      data,
    });
    return category;
  }

  async update(id: string, payload: UpdateCategoryDto): Promise<Category> {
    const where: Prisma.CategoryWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };

    const category = await this._categoriesRepository.getOneCategory({
      where,
    });
    if (!category) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }

    return await this._categoriesRepository.updateCategory({
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

    const category = await this._categoriesRepository.getOneCategory({
      where,
    });
    if (!category) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }

    const data = {
      deletedAt: new Date(),
    };
    return this._categoriesRepository.updateCategory({
      where,
      data,
    });
  }
}
