import { JwtConsts } from '#common/constants';
import { AuthGetStarted } from '#common/types/auth-get-started.type';
import { LoginResponse } from '#common/types/login-response.type';
import { SignatureData } from '#common/types/signature-data.type';
import { UserProfile } from '#common/types/user-profile.type';
import { generateHash, isMatchingHash } from '#common/utils';
import { AUTH_LOGIN_FAILED } from '#contents/errors/auth.error';
import { USER_ALREDADY_EXISTS } from '#contents/errors/user.error';
import { UsersRepository } from '#modules/users/users.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { RegisterUserDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _jwtService: JwtService,
  ) {}

  async checkingExistedUser(email: string): Promise<AuthGetStarted> {
    const user = await this._usersRepository.getFirstUser({
      where: {
        email,
      },
    });

    return {
      existed: !!user,
    };
  }

  async register(payload: RegisterUserDto): Promise<User> {
    const existingUser = await this._usersRepository.getFirstUser({
      where: {
        email: payload.email,
      },
    });
    if (existingUser) {
      throw new BadRequestException(USER_ALREDADY_EXISTS);
    }

    const passwordHash = generateHash(payload.password);

    const data = {
      ...payload,
      password: passwordHash,
    };

    const user = await this._usersRepository.createUser({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
      data,
    });

    return user;
  }

  async validateLoginUser(
    email: string,
    password: string,
  ): Promise<UserProfile> {
    const user = await this._usersRepository.getFirstUser({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequestException(AUTH_LOGIN_FAILED);
    }

    const { password: passwordHash, ...userProfile } = user;

    if (!isMatchingHash(password, passwordHash)) {
      throw new BadRequestException(AUTH_LOGIN_FAILED);
    }

    return userProfile;
  }

  login(user: UserProfile): LoginResponse {
    const data: SignatureData = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this._jwtService.sign(data, {
      expiresIn: JwtConsts.ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = this._jwtService.sign(data, {
      expiresIn: JwtConsts.REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
