import { StrategyConsts } from '#common/constants';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtCustomerGuard extends AuthGuard(StrategyConsts.JWT_CUSTOMER) {}
