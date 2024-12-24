import { GettingAllResponse } from '#common/types/getting-all-response.type';
import { generateRandomString, generateSlug } from '#common/utils';
import { BRAND_NOT_FOUND } from '#contents/errors/brand.error';
import { CATEGORY_NOT_FOUND } from '#contents/errors/category.error';
import {
  PRODUCT_ALREADY_EXISTS,
  PRODUCT_BAD_QUERIES,
  PRODUCT_NOT_FOUND,
} from '#contents/errors/product.error';
import { BrandsService } from '#modules/brands/brands.service';
import { CategoriesService } from '#modules/categories/categories.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { CreateProductDto } from './dtos/create.dto';
import { FilterProductDto } from './dtos/filter.dto';
import { UpdateProductDto } from './dtos/update.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly _productsRepository: ProductsRepository,
    private readonly _categoriesService: CategoriesService,
    private readonly _brandsService: BrandsService,
  ) {}

  async _isExistedSku(sku: string): Promise<boolean> {
    const select: Prisma.ProductSelect = {
      id: true,
    };
    const where: Prisma.ProductWhereInput = {
      sku,
      deletedAt: {
        equals: null,
      },
    };
    const product = await this._productsRepository.getFirstProduct({
      where,
      select,
    });

    return !!product;
  }

  async _generateSlug(title: string): Promise<string> {
    const originalSlug = generateSlug(title);
    let slug = originalSlug;

    while (true) {
      const select: Prisma.ProductSelect = {
        id: true,
      };
      const where: Prisma.ProductWhereInput = {
        slug,
        deletedAt: {
          equals: null,
        },
      };
      const product = await this._productsRepository.getFirstProduct({
        where,
        select,
      });

      if (!product) {
        break;
      }
      slug = `${originalSlug}-${generateRandomString(8)}`;
    }

    return slug;
  }

  async getAll(filter: FilterProductDto): Promise<GettingAllResponse<Product>> {
    const flatSearchKeys = ['title', 'sku'];

    const select: Prisma.ProductSelect = {
      id: true,
      title: true,
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

    const orderBy = filter.sort
      ? filter.sort.map((field) => ({
          [field.field]: field.value,
        }))
      : [];

    const where: Prisma.ProductWhereInput = {
      deletedAt: {
        equals: null,
      },
    };

    if (filter.search) {
      where.OR = [
        ...flatSearchKeys.map((field) => ({
          [field]: {
            contains: filter.search,
            mode: 'insensitive',
          },
        })),
        ...[
          {
            category: {
              name: {
                contains: filter.search,
              },
            },
          },
          {
            brand: {
              name: {
                contains: filter.search,
              },
            },
          },
        ],
      ];
    }
    if (filter.filter && filter.filter.length > 0) {
      where.AND = filter.filter
        .filter((field) => !['category', 'brand'].includes(field.field))
        .map((field) => ({
          [field.field]: field.value,
        }));

      const categoryFilter = filter.filter.find(
        (field) => field.field === 'category',
      );
      const brandFilter = filter.filter.find(
        (field) => field.field === 'brand',
      );

      if (categoryFilter) {
        where.category = {
          name: {
            equals: categoryFilter.value,
          },
        };
      }
      if (brandFilter) {
        where.brand = {
          name: {
            equals: brandFilter.value,
          },
        };
      }
    }

    let products: Array<Product>;

    const count = await this._productsRepository.getProductsCount({ where });

    if (!filter.noPagination) {
      const { page, limit } = filter;
      if (!page || !limit) {
        throw new BadRequestException(PRODUCT_BAD_QUERIES);
      }

      const skip = (page - 1) * limit;

      products = await this._productsRepository.getAllProducts({
        select,
        where,
        orderBy,
        skip,
        take: limit,
      });
    } else {
      products = await this._productsRepository.getAllProducts({
        select,
        where,
        orderBy,
      });
    }
    return {
      count,
      data: products,
    };
  }

  async getById(id: string): Promise<Product | null> {
    const select: Prisma.ProductSelect = {
      id: true,
      title: true,
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
    const isExistedSku = await this._isExistedSku(payload.sku);
    if (isExistedSku) {
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

    const slug = await this._generateSlug(payload.title);

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

    if (payload.sku) {
      const isExistedSku = await this._isExistedSku(payload.sku);
      if (isExistedSku) {
        throw new BadRequestException(PRODUCT_ALREADY_EXISTS);
      }
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
