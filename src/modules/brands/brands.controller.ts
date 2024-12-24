import { PaginationInterceptor } from '#common/interceptors/pagination.interceptor';
import { ZodValidationPipe } from '#common/pipes/zod-validation-pipe';
import { GettingAllResponse } from '#common/types/getting-all-response.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Brand } from '@prisma/client';
import { BrandsService } from './brands.service';
import { CreateBrandDto, createBrandSchema } from './dtos/create.dto';
import { FilterBrandDto, filterBrandSchema } from './dtos/filter.dto';
import { UpdateBrandDto, updateBrandSchema } from './dtos/update.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly _brandsService: BrandsService) {}

  @Get()
  @UseInterceptors(PaginationInterceptor)
  async getAll(
    @Query(new ZodValidationPipe(filterBrandSchema)) queries: FilterBrandDto,
  ): Promise<GettingAllResponse<Brand>> {
    return this._brandsService.getAll(queries);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Brand | null> {
    return this._brandsService.getById(id);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createBrandSchema)) body: CreateBrandDto,
  ): Promise<Brand> {
    return this._brandsService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBrandSchema)) body: UpdateBrandDto,
  ): Promise<Brand> {
    return this._brandsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Brand> {
    return this._brandsService.delete(id);
  }
}
