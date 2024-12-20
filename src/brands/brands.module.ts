import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { BrandsController } from './brands.controller';
import { BrandsRepository } from './brands.repository';
import { BrandsService } from './brands.service';

@Module({
  providers: [BrandsService, BrandsRepository, PrismaService],
  controllers: [BrandsController],
  exports: [BrandsService],
})
export class BrandsModule {}
