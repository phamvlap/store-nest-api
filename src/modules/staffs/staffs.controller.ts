import { ZodValidationPipe } from '#common/pipes/zod-validation-pipe';
import { Body, Controller, Post } from '@nestjs/common';
import { Staff } from '@prisma/client';
import { CreateStaffDto, createStaffSchema } from './dtos/create.dto';
import { StaffsService } from './staffs.service';

@Controller('staffs')
export class StaffsController {
  constructor(private readonly _staffsService: StaffsService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createStaffSchema)) payload: CreateStaffDto,
  ): Promise<Staff> {
    return this._staffsService.create(payload);
  }
}
