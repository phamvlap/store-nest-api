import { Injectable } from '@nestjs/common';
import { Brand, Prisma } from '@prisma/client';
import { CreateBrandDto } from '../dtos/brand/create.dto';
import { UpdateBrandDto } from '../dtos/brand/update.dto';
import { generateRandomString } from '../utils/generate-random-string';
import { generateSlug } from '../utils/generate-slug';
import { BrandsRepository } from './brands.repository';

@Injectable()
export class BrandsService {
  constructor(private readonly _brandsRepository: BrandsRepository) {}

  async getAll(): Promise<Array<Brand>> {
    const where: Prisma.BrandWhereInput = {
      deletedAt: {
        equals: null,
      },
    };
    return this._brandsRepository.getAllBrands({ where });
  }

  async getById(id: string): Promise<Brand | null> {
    const where: Prisma.BrandWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    return this._brandsRepository.getOneBrand({ where });
  }

  async create(payload: CreateBrandDto): Promise<Brand> {
    const originalSlug = generateSlug(payload.name);
    const brands = await this.getAll();
    const existSlugs = new Set(brands.map((brand) => brand.slug));

    let slug = originalSlug;
    while (existSlugs.has(slug)) {
      slug = `${originalSlug}-${generateRandomString(8)}`;
    }

    const data = {
      ...payload,
      slug,
    };
    return this._brandsRepository.createBrand({ data });
  }

  async update(id: string, payload: UpdateBrandDto): Promise<Brand> {
    const where: Prisma.BrandWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    return this._brandsRepository.updateBrand({
      where,
      data: payload,
    });
  }

  async delete(id: string): Promise<Brand> {
    const where: Prisma.BrandWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    const data: Prisma.BrandUpdateInput = {
      deletedAt: new Date(),
    };
    return this._brandsRepository.updateBrand({
      where,
      data,
    });
  }
}
