import { BrandsModule } from '#modules/brands/brands.module';
import { CategoriesModule } from '#modules/categories/categories.module';
import { ProductsModule } from '#modules/products/products.module';
import { PrismaModule } from '#shared/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrismaModule, CategoriesModule, BrandsModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
