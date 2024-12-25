import { PrismaService } from '#shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async getAllCategories(
    args?: Prisma.CategoryFindManyArgs,
  ): Promise<Array<Category>> {
    return this._prisma.category.findMany(args);
  }

  async getCategoriesCount(args: Prisma.CategoryCountArgs): Promise<number> {
    return this._prisma.category.count(args);
  }

  async getUniqueCategory(
    args: Prisma.CategoryFindUniqueArgs,
  ): Promise<Category | null> {
    return this._prisma.category.findUnique(args);
  }

  async getFirstCategory(
    args: Prisma.CategoryFindFirstArgs,
  ): Promise<Category | null> {
    return this._prisma.category.findFirst(args);
  }

  async createCategory(args: Prisma.CategoryCreateArgs): Promise<Category> {
    return this._prisma.category.create(args);
  }

  async updateCategory(args: Prisma.CategoryUpdateArgs): Promise<Category> {
    return this._prisma.category.update(args);
  }
}
