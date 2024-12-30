import { StrategyConsts } from '#common/constants';
import { UserProfile } from '#common/types/user-profile.type';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../auth.service';

@Injectable()
export class LocalCustomerStrategy extends PassportStrategy(
  Strategy,
  StrategyConsts.LOCAL_CUSTOMER,
) {
  constructor(private readonly _authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<UserProfile> {
    const user = await this._authService.validateLoginCustomer(email, password);

    return user;
  }
}
