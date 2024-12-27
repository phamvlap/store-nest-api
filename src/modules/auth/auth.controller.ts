import { ZodValidationPipe } from '#common/pipes/zod-validation-pipe';
import { AuthGetStarted } from '#common/types/auth-get-started.type';
import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetStartedDto, getStartedSchema } from './dtos/get-started.dto';
import { RegisterUserDto, registerUserSchema } from './dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('get-started')
  async getStarted(
    @Body(new ZodValidationPipe(getStartedSchema)) body: GetStartedDto,
  ): Promise<AuthGetStarted> {
    return this._authService.checkingExistedUser(body.email);
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerUserSchema))
    registerDto: RegisterUserDto,
  ): Promise<User> {
    return this._authService.register(registerDto);
  }
}
