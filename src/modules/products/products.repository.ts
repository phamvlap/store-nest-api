import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async getAllProducts(
    args: Prisma.ProductFindManyArgs,
  ): Promise<Array<Product>> {
    return this._prisma.product.findMany(args);
  }

  async getOneProduct(
    args: Prisma.ProductFindUniqueArgs,
  ): Promise<Product | null> {
    return this._prisma.product.findUnique(args);
  }

  async createProduct(args: Prisma.ProductCreateArgs): Promise<Product> {
    return this._prisma.product.create(args);
  }

  async updateProduct(args: Prisma.ProductUpdateArgs): Promise<Product> {
    return this._prisma.product.update(args);
  }
}
