import { AdminModule } from '#modules/admin/admin.module';
import { AuthModule } from '#modules/auth/auth.module';
import { BrandsModule } from '#modules/brands/brands.module';
import { CategoriesModule } from '#modules/categories/categories.module';
import { ProductsModule } from '#modules/products/products.module';
import { UsersModule } from '#modules/users/users.module';
import { PrismaModule } from '#shared/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
