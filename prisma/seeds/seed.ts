import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { Brand, Category, Prisma, PrismaClient } from '@prisma/client';
import { generateRandomString } from '../../src/utils/generate-random-string';
import { isEmptyObject } from '../../src/utils/is-empty-object';

const prisma = new PrismaClient();

const seed = async () => {
  const productDataPath = resolve(__dirname, 'products-crawl');

  const seedFiles = readdirSync(productDataPath);
  const categoriesName = seedFiles.map((fileName) => fileName.split('.')[0]);

  const categoriesData = categoriesName.map((categoryName, index) => {
    return {
      name: categoryName.split('-').join(' '),
      slug: categoryName.split(' ').join('-').toLowerCase(),
      ordering: index,
    };
  });

  const categories: Array<Category> = await prisma.category.createManyAndReturn(
    {
      data: categoriesData,
    },
  );

  const brandsData: Array<Prisma.BrandCreateInput> = [];

  const cleanedProducts = [];
  const urls: Array<string> = [];
  const skus: Array<string> = [];
  const productSlugs: Array<string> = [];

  categories.forEach((category, index) => {
    const data = readFileSync(
      `${productDataPath}/${categoriesName[index]}.json`,
    );

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
        const brandName = rawProduct.brand;
        let brandSlug = null;
        let productSlug = rawProduct.title.split(' ').join('-').toLowerCase();

        if (brandName && brandName !== '') {
          const brandIndex = brandsData.findIndex(
            (brand) => brand.name === brandName,
          );
          if (brandIndex !== -1) {
            brandSlug = brandsData[brandIndex].slug;
          } else {
            brandSlug = brandName.split(' ').join('-').toLowerCase();
            brandsData.push({
              name: brandName,
              slug: brandSlug,
            });
          }
        }

        if (productSlugs.includes(productSlug)) {
          productSlug = `${productSlug}-${generateRandomString(8)}`;
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
          brandId: brandMapping[brandSlug as string],
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
