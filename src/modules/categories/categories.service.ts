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

  async _generateSlug(name: string): Promise<string> {
    const originalSlug = generateSlug(name);
    let slug = originalSlug;

    while (true) {
      const select: Prisma.CategorySelect = {
        id: true,
      };
      const where: Prisma.CategoryWhereInput = {
        slug,
        deletedAt: {
          equals: null,
        },
      };
      const category = await this._categoriesRepository.getFirstCategory({
        where,
        select,
      });
      if (!category) {
        break;
      }
      slug = `${originalSlug}-${generateRandomString(8)}`;
    }
    return slug;
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
    const slug = await this._generateSlug(payload.name);

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
