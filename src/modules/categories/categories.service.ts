import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { generateRandomString } from '../../common/utils/generate-random-string';
import { generateSlug } from '../../common/utils/generate-slug';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dtos/create.dto';
import { UpdateCategoryDto } from './dtos/update.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly _categoriesRepository: CategoriesRepository) {}

  async getAll(): Promise<Array<Category>> {
    try {
      const where: Prisma.CategoryWhereInput = {
        deletedAt: {
          equals: null,
        },
      };
      const categories = await this._categoriesRepository.getAllCategories({
        where,
      });
      return categories;
    } catch (error) {
      throw new InternalServerErrorException();
    }
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
      throw new NotFoundException('Resource not found');
    }
    return category;
  }

  async create(payload: CreateCategoryDto): Promise<Category> {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, payload: UpdateCategoryDto): Promise<Category> {
    try {
      const where: Prisma.CategoryWhereUniqueInput = {
        id,
        deletedAt: {
          equals: null,
        },
      };
      const category = await this._categoriesRepository.updateCategory({
        where,
        data: payload,
      });
      return category;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async delete(id: string): Promise<Category> {
    try {
      const where: Prisma.CategoryWhereUniqueInput = {
        id,
        deletedAt: {
          equals: null,
        },
      };
      const data = {
        deletedAt: new Date(),
      };
      const category = await this._categoriesRepository.updateCategory({
        where,
        data,
      });
      return category;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
