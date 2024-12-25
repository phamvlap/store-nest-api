import { AccountsModule } from '#modules/accounts/accounts.module';
import { AccountsRepository } from '#modules/accounts/accounts.repository';
import { AccountsService } from '#modules/accounts/accounts.service';
import { Module } from '@nestjs/common';
import { StaffsController } from './staffs.controller';
import { StaffsRepository } from './staffs.repository';
import { StaffsService } from './staffs.service';

@Module({
  imports: [AccountsModule],
  controllers: [StaffsController],
  providers: [
    StaffsService,
    StaffsRepository,
    AccountsService,
    AccountsRepository,
  ],
})
export class StaffsModule {}
