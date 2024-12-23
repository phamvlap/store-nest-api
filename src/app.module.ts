import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [CategoriesModule, BrandsModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
