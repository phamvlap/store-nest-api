import { StrategyConsts } from '#common/constants';
import { SignatureData } from '#common/types/signature-data.type';
import { UserProfile } from '#common/types/user-profile.type';
import { AuthService } from '#modules/auth/auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtCustomerStrategy extends PassportStrategy(
  Strategy,
  StrategyConsts.JWT_CUSTOMER,
) {
  constructor(private readonly _authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY as string,
    });
  }

  async validate(payload: SignatureData): Promise<UserProfile> {
    const userProfile = await this._authService.validateCustomerProfile(
      payload.sub,
    );

    return userProfile;
  }
}
