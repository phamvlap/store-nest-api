import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Product } from '@prisma/client';
import { ZodValidationPipe } from '../../common/pipes/zod-validation-pipe';
import { CreateProductDto, createProductSchema } from './dtos/create.dto';
import { UpdateProductDto, updateProductSchema } from './dtos/update.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly _productsService: ProductsService) {}

  @Get()
  async getAll(): Promise<Array<Product>> {
    return this._productsService.getAll();
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
