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
import { Product } from '@prisma/client';
import { CreateProductDto, createProductSchema } from './dtos/create.dto';
import { FilterProductDto, filterProductSchema } from './dtos/filter.dto';
import { UpdateProductDto, updateProductSchema } from './dtos/update.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly _productsService: ProductsService) {}

  @Get()
  @UseInterceptors(PaginationInterceptor)
  async getAll(
    @Query(new ZodValidationPipe(filterProductSchema)) filter: FilterProductDto,
  ): Promise<GettingAllResponse<Product>> {
    return this._productsService.getAll(filter);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Product | null> {
    return this._productsService.getById(id);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createProductSchema)) body: CreateProductDto,
  ): Promise<Product> {
    return this._productsService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) body: UpdateProductDto,
  ): Promise<Product> {
    return this._productsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Product> {
    return this._productsService.delete(id);
  }
}
