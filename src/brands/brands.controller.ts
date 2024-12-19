import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Brand } from '@prisma/client';
import { CreateBrandDto, createBrandSchema } from '../dtos/brand/create.dto';
import { UpdateBrandDto, updateBrandSchema } from '../dtos/brand/update.dto';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly _brandsService: BrandsService) {}

  @Get()
  async getAll(): Promise<Array<Brand>> {
    return this._brandsService.getAll();
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
