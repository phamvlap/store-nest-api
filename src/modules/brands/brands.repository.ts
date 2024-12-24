import { Injectable } from '@nestjs/common';
import { Brand, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class BrandsRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async getAllBrands(args?: Prisma.BrandFindManyArgs): Promise<Array<Brand>> {
    return this._prisma.brand.findMany(args);
  }

  async getBrandsCount(args: Prisma.BrandCountArgs): Promise<number> {
    return this._prisma.brand.count(args);
  }

  async getOneBrand(args: Prisma.BrandFindUniqueArgs): Promise<Brand | null> {
    return this._prisma.brand.findUnique(args);
  }

  async getFirstBrand(args: Prisma.BrandFindFirstArgs): Promise<Brand | null> {
    return this._prisma.brand.findFirst(args);
  }

  async createBrand(args: Prisma.BrandCreateArgs): Promise<Brand> {
    return this._prisma.brand.create(args);
  }

  async updateBrand(args: Prisma.BrandUpdateArgs): Promise<Brand> {
    return this._prisma.brand.update(args);
  }
}
