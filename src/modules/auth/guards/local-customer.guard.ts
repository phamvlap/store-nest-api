import { StrategyConsts } from '#common/constants';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalCustomerGuard extends AuthGuard(
  StrategyConsts.LOCAL_CUSTOMER,
) {}
