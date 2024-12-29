import { RequestUser } from '#common/decorators/request-user.decorator';
import { ZodValidationPipe } from '#common/pipes/zod-validation-pipe';
import { AuthGetStarted } from '#common/types/auth-get-started.type';
import { LoginResponse } from '#common/types/login-response.type';
import { UserProfile } from '#common/types/user-profile.type';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetStartedDto, getStartedSchema } from './dtos/get-started.dto';
import { RegisterUserDto, registerUserSchema } from './dtos/register.dto';
import { ResetCodeDto, resetCodeSchema } from './dtos/reset-code.dto';
import {
  ResetPasswordDto,
  resetPasswordSchema,
} from './dtos/reset-password.dto';
import { LocalUserGuard } from './guards/local-user.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('get-started')
  async getStarted(
    @Body(new ZodValidationPipe(getStartedSchema)) body: GetStartedDto,
  ): Promise<AuthGetStarted> {
    return this._authService.checkExistedUser(body.email);
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerUserSchema))
    registerDto: RegisterUserDto,
  ): Promise<User> {
    return this._authService.register(registerDto);
  }

  @UseGuards(LocalUserGuard)
  @Post('login')
  login(@RequestUser() user: UserProfile): LoginResponse {
    return this._authService.login(user);
  }

  @Post('send-reset-code')
  async sendCode(
    @Body(new ZodValidationPipe(resetCodeSchema)) body: ResetCodeDto,
  ): Promise<void> {
    return this._authService.sendSecretCode(body.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordDto,
  ): Promise<void> {
    return this._authService.resetPassword(body);
  }
}
