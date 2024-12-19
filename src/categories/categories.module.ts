import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService, CategoriesRepository],
})
export class CategoriesModule {}
