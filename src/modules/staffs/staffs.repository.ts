import { PrismaService } from '#shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Staff } from '@prisma/client';

@Injectable()
export class StaffsRepository {
  constructor(private readonly _prismaService: PrismaService) {}

  async createStaff(args: Prisma.StaffCreateArgs): Promise<Staff> {
    return this._prismaService.staff.create(args);
  }

  async getFirstStaff(args: Prisma.StaffFindFirstArgs): Promise<Staff | null> {
    return this._prismaService.staff.findFirst(args);
  }
}
