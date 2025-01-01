import { StrategyConsts } from '#common/constants';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAdminGuard extends AuthGuard(StrategyConsts.LOCAL_ADMIN) {}
