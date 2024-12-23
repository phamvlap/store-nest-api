import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async getAllCategories(
    args?: Prisma.CategoryFindManyArgs,
  ): Promise<Array<Category>> {
    return this._prisma.category.findMany(args);
  }

  async getOneCategory(
    args: Prisma.CategoryFindUniqueArgs,
  ): Promise<Category | null> {
    return this._prisma.category.findUnique(args);
  }

  async createCategory(args: Prisma.CategoryCreateArgs): Promise<Category> {
    return this._prisma.category.create(args);
  }

  async updateCategory(args: Prisma.CategoryUpdateArgs): Promise<Category> {
    return this._prisma.category.update(args);
  }
}
