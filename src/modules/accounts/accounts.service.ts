import { generateHashSHA256 } from '#common/utils';
import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dtos/create.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly _accountsRepository: AccountsRepository) {}

  async create(payload: CreateAccountDto): Promise<Account> {
    const passwordHash = generateHashSHA256(payload.password);
    const data: Prisma.AccountCreateInput = {
      email: payload.email,
      password: passwordHash,
    };

    return this._accountsRepository.create({ data });
  }
}
