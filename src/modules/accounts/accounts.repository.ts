import { PrismaService } from '#shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';

@Injectable()
export class AccountsRepository {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(args: Prisma.AccountCreateArgs): Promise<Account> {
    return this._prismaService.account.create(args);
  }
}
