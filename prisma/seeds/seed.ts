import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Brand, Category, Prisma, PrismaClient } from '@prisma/client';
import { generateBeautiString } from '../../src/common/utils/generate-beauti-string';
import { generateRandomString } from '../../src/common/utils/generate-random-string';
import { generateSlug } from '../../src/common/utils/generate-slug';
import { isEmptyObject } from '../../src/common/utils/is-empty-object';

const prisma = new PrismaClient();

const seed = async () => {
  const productDataPath = resolve(__dirname, 'products-crawl');
  const seedFileNames = readdirSync(productDataPath);

  if (seedFileNames.length === 0) {
    throw new BadRequestException('No seed files found');
  }
  if (seedFileNames.some((fileName) => !fileName.endsWith('.json'))) {
    throw new BadRequestException('Seed files must be JSON format');
  }

  const categoriesName = seedFileNames.map((fileName) =>
    fileName.replace('.json', ''),
  );

  const existingCategorySlugs: Array<string> = [];

  const categoriesData: Array<Prisma.CategoryCreateInput> = categoriesName.map(
    (categoryName, index) => {
      const originalSlug = generateSlug(categoryName);
      let slug = originalSlug;

      while (existingCategorySlugs.includes(slug)) {
        slug = `${originalSlug}-${generateRandomString(8)}`;
      }
      existingCategorySlugs.push(slug);

      return {
        name: generateBeautiString(categoryName, /[-_.]/gi),
        slug,
        ordering: index,
      };
    },
  );

  const categories: Array<Category> = await prisma.category.createManyAndReturn(
    {
      data: categoriesData,
    },
  );

  const brandsData: Array<Prisma.BrandCreateInput> = [];
  const cleanedProducts: Array<
    Prisma.ProductCreateManyInput & {
      brandSlug: string | null;
    }
  > = [];
  const urls: Array<string> = [];
  const skus: Array<string> = [];
  const productSlugs: Array<string> = [];
  const brandSlugs: Array<string> = [];

  categories.forEach((category, index) => {
    const data = readFileSync(`${productDataPath}/${seedFileNames[index]}`);

    const rawProductsPerCategory = JSON.parse(data.toString());

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

      if (isValid) {
        if (urls.includes(rawProduct.url_source)) {
          isValid = false;
        } else {
          urls.push(rawProduct.url_source);
        }
      }
      if (isValid) {
        if (skus.includes(rawProduct.sku)) {
          isValid = false;
        } else {
          skus.push(rawProduct.sku);
        }
      }

      if (isValid) {
        const brandName = rawProduct.brand as string;
        let brandSlug: string | null = null;
        const originalProductSlug = generateSlug(rawProduct.title as string);
        let productSlug = originalProductSlug;

        if (brandName && brandName !== '') {
          const brandIndex = brandsData.findIndex(
            (brand) => brand.name === brandName,
          );
          if (brandIndex !== -1) {
            brandSlug = brandsData[brandIndex].slug;
          } else {
            const originalSlug = generateSlug(brandName);
            brandSlug = originalSlug;

            while (brandSlugs.includes(brandSlug)) {
              brandSlug = `${originalSlug}-${generateRandomString(8)}`;
            }

            brandSlugs.push(brandSlug);
            brandsData.push({
              name: brandName,
              slug: brandSlug,
            });
          }
        }

        while (productSlugs.includes(productSlug)) {
          productSlug = `${originalProductSlug}-${generateRandomString(8)}`;
        }
        productSlugs.push(productSlug);

        cleanedProducts.push({
          title: rawProduct.title,
          urlSource: rawProduct.url_source,
          description: rawProduct.description,
          sku: rawProduct.sku,
          price: rawProduct.price,
          features: rawProduct.features,
          specifications: rawProduct.specifications,
          images: rawProduct.images,
          warranty: rawProduct.warranty,
          deliveryInformation: rawProduct.delivery_information,
          categoryId: category.id,
          brandSlug,
          slug: productSlug,
        });
      }
    }
  });

  const brands: Array<Brand> = await prisma.brand.createManyAndReturn({
    data: brandsData,
  });

  const brandMapping: Record<string, string> = {};
  for (const brand of brands) {
    brandMapping[brand.slug] = brand.id;
  }

  const productsData: Array<Prisma.ProductCreateManyInput> =
    cleanedProducts.map((product) => {
      const { brandSlug, ...formattedData } = product;

      if (brandSlug) {
        return {
          ...formattedData,
          brandId: brandMapping[brandSlug],
        };
      } else {
        return {
          ...formattedData,
        };
      }
    });

  try {
    await prisma.product.createMany({
      data: productsData,
    });
  } catch (e) {
    console.log(e);
  }
};

seed();
