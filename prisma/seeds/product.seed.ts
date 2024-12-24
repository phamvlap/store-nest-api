import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Brand, Category, Prisma, PrismaClient } from '@prisma/client';
import { generateBeautiString } from '../../src/common/utils/generate-beauti-string';
import { generateRandomString } from '../../src/common/utils/generate-random-string';
import { generateSlug } from '../../src/common/utils/generate-slug';
import { isDirectory } from '../../src/common/utils/is-directory';
import { isEmptyObject } from '../../src/common/utils/is-empty-object';

type CreateCategoryInput = {
  name: string;
};

type RawProductData = {
  title: string | null;
  url_source: string | null;
  description?: string;
  sku: string | null;
  price?: number;
  features?: Array<string>;
  specifications: string | null;
  images: Array<string> | null;
  warranty?: string;
  delivery_information: string | null;
  brand: string | null;
};

const DIR_NOT_FOUND = {
  code: 'dir_not_found',
  message: 'Directory not found',
};

const FILE_NOT_FOUND = {
  code: 'file_not_found',
  message: 'File not found',
};

const FILE_NOT_JSON_FORMAT = {
  code: 'file_not_json_format',
  message: 'File not json format',
};

export class ProductSeed {
  private _prismaClient: PrismaClient;
  private _separatorLength = 80;

  constructor() {
    this._prismaClient = new PrismaClient();
  }

  _readFilesFromDir(dirName: string): Array<string> {
    const dirPath = resolve(__dirname, dirName);
    if (!isDirectory(dirPath)) {
      throw new NotFoundException(DIR_NOT_FOUND);
    }
    const fileNames = readdirSync(dirPath);

    return fileNames;
  }

  _generateUniqueSlug(name: string, existingSlugs: Array<string>): string {
    const originalSlug = generateSlug(name);
    let slug = originalSlug;

    while (existingSlugs.includes(slug)) {
      slug = `${originalSlug}-${generateRandomString(8)}`;
    }

    return slug;
  }

  _readFileContent(filePath: string): Array<RawProductData> {
    const data = readFileSync(filePath);

    const parsedData = JSON.parse(data.toString());

    return parsedData;
  }

  async _createCategories(
    categoryInputs: Array<CreateCategoryInput>,
  ): Promise<Array<Category>> {
    const existingCategorySlugs: Array<string> = [];

    const categoriesData: Array<Prisma.CategoryCreateInput> =
      categoryInputs.map((categoryInput, index) => {
        const slug = this._generateUniqueSlug(
          categoryInput.name,
          existingCategorySlugs,
        );
        existingCategorySlugs.push(slug);

        return {
          name: generateBeautiString(categoryInput.name, /[-_.]/gi),
          slug,
          ordering: index,
        };
      });

    const categories: Array<Category> = [];

    for (let i = 0; i < categoriesData.length; i++) {
      const categoryData = categoriesData[i];
      const categoryDb = await this._prismaClient.category.findFirst({
        where: {
          name: categoriesData[i].name,
        },
      });
      if (categoryDb) {
        categories.push(categoryDb);
        console.log(
          `[${i + 1}/${categoriesData.length}] Existed - Skipping category: ${categoryData.name}`,
        );
        continue;
      }
      console.log(
        `[${i + 1}/${categoriesData.length}] Creating category: ${categoryData.name}`,
      );
      const category = await this._prismaClient.category.create({
        data: categoryData,
      });
      categories.push(category);
    }

    this._printSeparatedLine(this._separatorLength);

    return categories;
  }

  async _createBrands(
    brandsData: Array<Prisma.BrandCreateInput>,
  ): Promise<Array<Brand>> {
    const brands: Array<Brand> = [];

    for (let i = 0; i < brandsData.length; i++) {
      const brandData = brandsData[i];
      const brandDb = await this._prismaClient.brand.findFirst({
        where: {
          name: brandData.name,
        },
      });
      if (brandDb) {
        brands.push(brandDb);
        console.log(
          `[${i + 1}/${brandsData.length}] Existed - Skipping brand: ${brandData.name}`,
        );
        continue;
      }
      console.log(
        `[${i + 1}/${brandsData.length}] Creating brand: ${brandData.name}`,
      );
      const brand = await this._prismaClient.brand.create({
        data: brandData,
      });
      brands.push(brand);
    }

    this._printSeparatedLine(this._separatorLength);

    return brands;
  }

  async _createProducts(
    productsData: Array<Prisma.ProductCreateInput>,
  ): Promise<void> {
    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i];
      const productDb = await this._prismaClient.product.findFirst({
        where: {
          title: productData.title,
        },
      });
      if (productDb) {
        console.log(
          `[${i + 1}/${productsData.length}] Existed - Skipping product: ${productData.title}`,
        );
        continue;
      }
      console.log(
        `[${i + 1}/${productsData.length}] Creating product: ${productData.title}`,
      );
      await this._prismaClient.product.create({
        data: productData,
      });
    }

    this._printSeparatedLine(this._separatorLength);
  }

  _printSeparatedLine(numChars: number): void {
    console.log('='.repeat(numChars), '\n');
  }

  async main() {
    const dirName = 'data';
    const dirPath = resolve(__dirname, dirName);
    const seedFileNames = this._readFilesFromDir(dirName);

    if (seedFileNames.length === 0) {
      throw new NotFoundException(FILE_NOT_FOUND);
    }
    if (seedFileNames.some((fileName) => !fileName.endsWith('.json'))) {
      throw new BadRequestException(FILE_NOT_JSON_FORMAT);
    }

    const categoryInputs = seedFileNames.map((fileName) => ({
      name: fileName.replace('.json', ''),
    }));

    const categories: Array<Category> =
      await this._createCategories(categoryInputs);

    const brandsData: Array<Prisma.BrandCreateInput> = [];
    const cleanedProducts: Array<
      Prisma.ProductCreateInput & {
        brandSlug: string | null;
      }
    > = [];
    const urls: Array<string> = [];
    const skus: Array<string> = [];
    const productSlugs: Array<string> = [];
    const brandSlugs: Array<string> = [];

    categories.forEach((category, index) => {
      const filePath = `${dirPath}/${seedFileNames[index]}`;
      const rawProductsPerCategory = this._readFileContent(filePath);

      const requiredListFields = ['images'];
      const requiredStringFields = [
        'title',
        'url_source',
        'sku',
        'specifications',
      ];

      for (const rawProduct of rawProductsPerCategory) {
        let isValid = true;

        if (isEmptyObject(rawProduct)) {
          isValid = false;
        }

        if (isValid) {
          for (const field of requiredListFields) {
            if (!rawProduct[field] || rawProduct[field].length === 0) {
              isValid = false;
              break;
            }
          }
        }
        if (isValid) {
          for (const field of requiredStringFields) {
            if (!rawProduct[field] || rawProduct[field] === '') {
              isValid = false;
              break;
            }
          }
        }

        const curUrl = rawProduct.url_source as string;
        const curSku = rawProduct.sku as string;

        if (isValid) {
          if (urls.includes(curUrl)) {
            isValid = false;
          } else {
            urls.push(curUrl);
          }
        }
        if (isValid) {
          if (skus.includes(curSku)) {
            isValid = false;
          } else {
            skus.push(curSku);
          }
        }

        if (isValid) {
          const brandName = rawProduct.brand as string;
          let brandSlug: string | null = null;

          if (brandName && brandName !== '') {
            const brandIndex = brandsData.findIndex(
              (brand) => brand.name === brandName,
            );
            if (brandIndex !== -1) {
              brandSlug = brandsData[brandIndex].slug;
            } else {
              brandSlug = this._generateUniqueSlug(brandName, brandSlugs);

              brandSlugs.push(brandSlug);
              brandsData.push({
                name: brandName,
                slug: brandSlug,
              });
            }
          }

          const productSlug = this._generateUniqueSlug(
            rawProduct.title as string,
            productSlugs,
          );
          productSlugs.push(productSlug);

          cleanedProducts.push({
            title: rawProduct.title as string,
            urlSource: curUrl,
            description: rawProduct.description,
            sku: curSku,
            price: rawProduct.price,
            features: rawProduct.features,
            specifications: rawProduct.specifications as string,
            images: rawProduct.images as Array<string>,
            warranty: rawProduct.warranty,
            deliveryInformation: rawProduct.delivery_information,
            category: {
              connect: {
                id: category.id,
              },
            },
            brandSlug,
            slug: productSlug,
          });
        }
      }
    });

    const brands: Array<Brand> = await this._createBrands(brandsData);
    const brandMapping: Record<string, string> = {};
    for (const brand of brands) {
      brandMapping[brand.slug] = brand.id;
    }

    const productsData: Array<Prisma.ProductCreateInput> = cleanedProducts.map(
      (product) => {
        const { brandSlug, ...formattedData } = product;

        return brandSlug
          ? {
              ...formattedData,
              brand: {
                connect: {
                  id: brandMapping[brandSlug],
                },
              },
            }
          : {
              ...formattedData,
            };
      },
    );

    await this._createProducts(productsData);
  }

  async run() {
    try {
      await this.main();
    } catch (error) {
      console.error(error);
    } finally {
      await this._prismaClient.$disconnect();
    }
  }

  test() {
    console.log(__dirname);
  }
}
