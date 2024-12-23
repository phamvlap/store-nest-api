import { Injectable, NotFoundException } from '@nestjs/common';
import { Brand, Prisma } from '@prisma/client';
import { generateRandomString } from '../../common/utils/generate-random-string';
import { generateSlug } from '../../common/utils/generate-slug';
import { BRAND_NOT_FOUND } from '../../contents/errors/brand.error';
import { BrandsRepository } from './brands.repository';
import { CreateBrandDto } from './dtos/create.dto';
import { UpdateBrandDto } from './dtos/update.dto';

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
    const brand = await this._brandsRepository.getOneBrand({ where });
    if (!brand) {
      throw new NotFoundException(BRAND_NOT_FOUND);
    }
    return brand;
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
    const brand = await this._brandsRepository.createBrand({ data });
    return brand;
  }

  async update(id: string, payload: UpdateBrandDto): Promise<Brand> {
    const where: Prisma.BrandWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };

    const brand = await this._brandsRepository.getOneBrand({ where });
    if (!brand) {
      throw new NotFoundException(BRAND_NOT_FOUND);
    }

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

    const brand = await this._brandsRepository.getOneBrand({ where });
    if (!brand) {
      throw new NotFoundException(BRAND_NOT_FOUND);
    }

    const data: Prisma.BrandUpdateInput = {
      deletedAt: new Date(),
    };
    return this._brandsRepository.updateBrand({
      where,
      data,
    });
  }
}
