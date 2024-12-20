import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const where: Prisma.BrandWhereInput = {
        deletedAt: {
          equals: null,
        },
      };
      return this._brandsRepository.getAllBrands({ where });
    } catch (error) {
      throw new InternalServerErrorException();
    }
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
      throw new NotFoundException('Resource not found');
    }
    return brand;
  }

  async create(payload: CreateBrandDto): Promise<Brand> {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, payload: UpdateBrandDto): Promise<Brand> {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async delete(id: string): Promise<Brand> {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
