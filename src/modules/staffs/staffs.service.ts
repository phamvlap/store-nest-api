import { STAFF_ALREADY_EXISTS } from '#contents/errors/staff.error';
import { AccountsService } from '#modules/accounts/accounts.service';
import { CreateAccountDto } from '#modules/accounts/dtos/create.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Staff } from '@prisma/client';
import { CreateStaffDto } from './dtos/create.dto';
import { StaffsRepository } from './staffs.repository';

@Injectable()
export class StaffsService {
  constructor(
    private readonly _staffsRepository: StaffsRepository,
    private readonly _accountsService: AccountsService,
  ) {}

  async create(payload: CreateStaffDto): Promise<Staff> {
    const where: Prisma.StaffWhereInput = {
      email: payload.email,
    };
    const existingStaff = await this._staffsRepository.getFirstStaff({ where });

    if (existingStaff) {
      throw new ConflictException(STAFF_ALREADY_EXISTS);
    }

    const accountPayload: CreateAccountDto = {
      email: payload.email,
      password: payload.password,
    };

    await this._accountsService.create(accountPayload);

    const staffData: Prisma.StaffCreateInput = {
      email: payload.email,
      name: payload.name,
      phoneNumber: payload.phoneNumber,
    };

    const staff = await this._staffsRepository.createStaff({ data: staffData });
    return staff;
  }
}
