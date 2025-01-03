import { PrismaService } from '#shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async getAllProducts(
    args: Prisma.ProductFindManyArgs,
  ): Promise<Array<Product>> {
    return this._prisma.product.findMany(args);
  }

  async getProductsCount(args: Prisma.ProductCountArgs): Promise<number> {
    return this._prisma.product.count(args);
  }

  async getUniqueProduct(
    args: Prisma.ProductFindUniqueArgs,
  ): Promise<Product | null> {
    return this._prisma.product.findUnique(args);
  }

  async getFirstProduct(
    args: Prisma.ProductFindFirstArgs,
  ): Promise<Product | null> {
    return this._prisma.product.findFirst(args);
  }

  async createProduct(args: Prisma.ProductCreateArgs): Promise<Product> {
    return this._prisma.product.create(args);
  }

  async updateProduct(args: Prisma.ProductUpdateArgs): Promise<Product> {
    return this._prisma.product.update(args);
  }
}
