import { JwtConsts } from '#common/constants';
import { AuthGetStarted } from '#common/types/auth-get-started.type';
import { LoginResponse } from '#common/types/login-response.type';
import { SignatureData } from '#common/types/signature-data.type';
import { UserProfile } from '#common/types/user-profile.type';
import {
  generateHash,
  generateRandomString,
  isMatchingHash,
} from '#common/utils';
import {
  AUTH_FAILED_RESET_PASSWORD,
  AUTH_LOGIN_FAILED,
  AUTH_UNAUTHORIZED,
} from '#contents/errors/auth.error';
import { USER_ALREDADY_EXISTS } from '#contents/errors/user.error';
import { UsersRepository } from '#modules/users/users.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { RegisterUserDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

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

  async validateUserProfile(id: string): Promise<UserProfile> {
    const user = await this._usersRepository.getFirstUser({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      throw new BadRequestException(AUTH_UNAUTHORIZED);
    }

    return user as UserProfile;
  }

  async sendSecretCode(email: string): Promise<void> {
    const user = await this._usersRepository.getFirstUser({
      where: {
        email,
      },
    });

    if (!user) {
      return;
    }

    let needToGenNewCode = true;
    let secretCode = generateRandomString(6, true, false);

    if (user.resetCode && user.resetCodeExpiresAt) {
      const now = new Date();
      const expiredAt = new Date(user.resetCodeExpiresAt);

      if (now.getTime() < expiredAt.getTime()) {
        secretCode = user.resetCode;
        needToGenNewCode = false;
      }
    }

    if (needToGenNewCode) {
      const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

      await this._usersRepository.updateUser({
        where: {
          id: user.id,
        },
        data: {
          resetCode: secretCode,
          resetCodeExpiresAt: expirationTime,
        },
      });
    }
    // TODO: Send secret code to user's email
  }

  async resetPassword(payload: ResetPasswordDto): Promise<void> {
    const user = await this._usersRepository.getFirstUser({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      throw new BadRequestException(AUTH_FAILED_RESET_PASSWORD);
    }

    if (!user.resetCode || user.resetCode !== payload.code) {
      throw new BadRequestException(AUTH_FAILED_RESET_PASSWORD);
    }

    if (
      !user.resetCodeExpiresAt ||
      new Date().getTime() > new Date(user.resetCodeExpiresAt).getTime()
    ) {
      throw new BadRequestException(AUTH_FAILED_RESET_PASSWORD);
    }

    const passwordHash = generateHash(payload.password);

    await this._usersRepository.updateUser({
      where: {
        id: user.id,
      },
      data: {
        password: passwordHash,
        resetCode: null,
        resetCodeExpiresAt: null,
      },
    });
  }
}
