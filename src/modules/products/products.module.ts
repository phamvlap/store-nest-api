import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { BrandsModule } from '../brands/brands.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [CategoriesModule, BrandsModule],
  providers: [ProductsService, PrismaService, ProductsRepository],
  controllers: [ProductsController],
})
export class ProductsModule {}
