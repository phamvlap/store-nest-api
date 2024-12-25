import { generateHash } from '#common/utils';
import { USER_ALREDADY_EXISTS } from '#contents/errors/user.error';
import { UsersRepository } from '#modules/users/users.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { RegisterUserDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly _usersRepository: UsersRepository) {}

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
}
