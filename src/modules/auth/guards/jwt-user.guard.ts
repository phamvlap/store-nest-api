import { StrategyConsts } from '#common/constants';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtUserGuard extends AuthGuard(StrategyConsts.JWT_USER) {}
