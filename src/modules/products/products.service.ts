import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { generateRandomString } from '../../common/utils/generate-random-string';
import { generateSlug } from '../../common/utils/generate-slug';
import { BRAND_NOT_FOUND } from '../../contents/errors/brand.error';
import { CATEGORY_NOT_FOUND } from '../../contents/errors/category.error';
import {
  PRODUCT_ALREADY_EXISTS,
  PRODUCT_NOT_FOUND,
} from '../../contents/errors/product.error';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dtos/create.dto';
import { UpdateProductDto } from './dtos/update.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly _productsRepository: ProductsRepository,
    private readonly _categoriesService: CategoriesService,
    private readonly _brandsService: BrandsService,
  ) {}

  async getAll(): Promise<Array<Product>> {
    const select: Prisma.ProductSelect = {
      id: true,
      title: true,
      urlSource: true,
      description: true,
      sku: true,
      price: true,
      features: true,
      specifications: true,
      images: true,
      warranty: true,
      deliveryInformation: true,
      slug: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    };
    const where: Prisma.ProductWhereInput = {
      deletedAt: {
        equals: null,
      },
    };
    const products = await this._productsRepository.getAllProducts({
      select,
      where,
    });
    return products;
  }

  async getById(id: string): Promise<Product | null> {
    const select: Prisma.ProductSelect = {
      id: true,
      title: true,
      urlSource: true,
      description: true,
      sku: true,
      price: true,
      features: true,
      specifications: true,
      images: true,
      warranty: true,
      deliveryInformation: true,
      slug: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    };
    const where: Prisma.ProductWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    const product = await this._productsRepository.getOneProduct({
      select,
      where,
    });
    if (!product) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }
    return product;
  }

  async create(payload: CreateProductDto): Promise<Product> {
    const products = await this.getAll();

    const existingSlugs = products.map((product) => product.slug);
    const existingUrls = new Set(products.map((product) => product.urlSource));
    const existingSkus = new Set(products.map((product) => product.sku));

    if (existingUrls.has(payload.urlSource) || existingSkus.has(payload.sku)) {
      throw new BadRequestException(PRODUCT_ALREADY_EXISTS);
    }

    const category = await this._categoriesService.getById(payload.categoryId);
    if (!category) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }

    if (payload.brandId) {
      const brand = await this._brandsService.getById(payload.brandId);
      if (!brand) {
        throw new NotFoundException(BRAND_NOT_FOUND);
      }
    }

    const originalSlug = generateSlug(payload.title);
    let slug = originalSlug;

    while (existingSlugs.includes(slug)) {
      slug = `${originalSlug}-${generateRandomString(8)}`;
    }

    const data = {
      ...payload,
      slug,
    };

    const product = await this._productsRepository.createProduct({
      data,
    });
    return product;
  }

  async update(id: string, payload: UpdateProductDto): Promise<Product> {
    const product = await this.getById(id);
    if (!product) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }

    const products = await this.getAll();

    const existingUrls = new Set(products.map((product) => product.urlSource));
    const existingSkus = new Set(products.map((product) => product.sku));

    if (
      (payload.urlSource && existingUrls.has(payload.urlSource)) ||
      (payload.sku && existingSkus.has(payload.sku))
    ) {
      throw new BadRequestException(PRODUCT_ALREADY_EXISTS);
    }

    if (payload.categoryId) {
      const category = await this._categoriesService.getById(
        payload.categoryId,
      );
      if (!category) {
        throw new NotFoundException(CATEGORY_NOT_FOUND);
      }
    }

    if (payload.brandId) {
      const brand = await this._brandsService.getById(payload.brandId);
      if (!brand) {
        throw new NotFoundException(BRAND_NOT_FOUND);
      }
    }

    const where: Prisma.ProductWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };

    const data = {
      ...payload,
    };

    return await this._productsRepository.updateProduct({
      where,
      data,
    });
  }

  async delete(id: string): Promise<Product> {
    const product = await this.getById(id);
    if (!product) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }

    const where: Prisma.ProductWhereUniqueInput = {
      id,
      deletedAt: {
        equals: null,
      },
    };
    const data: Prisma.ProductUpdateInput = {
      deletedAt: new Date(),
    };
    return await this._productsRepository.updateProduct({
      where,
      data,
    });
  }
}
