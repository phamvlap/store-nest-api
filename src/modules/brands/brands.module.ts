import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsRepository } from './brands.repository';
import { BrandsService } from './brands.service';

@Module({
  providers: [BrandsService, BrandsRepository],
  controllers: [BrandsController],
  exports: [BrandsService],
})
export class BrandsModule {}
