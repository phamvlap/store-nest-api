import { Injectable } from '@nestjs/common';
import { Brand, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class BrandsRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async getAllBrands(args?: Prisma.BrandFindManyArgs): Promise<Array<Brand>> {
    return this._prisma.brand.findMany(args);
  }

  async getOneBrand(args: Prisma.BrandFindUniqueArgs): Promise<Brand | null> {
    return this._prisma.brand.findUnique(args);
  }

  async createBrand(args: Prisma.BrandCreateArgs): Promise<Brand> {
    return this._prisma.brand.create(args);
  }

  async updateBrand(args: Prisma.BrandUpdateArgs): Promise<Brand> {
    return this._prisma.brand.update(args);
  }
}
