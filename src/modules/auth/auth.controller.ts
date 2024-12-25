import { ZodValidationPipe } from '#common/pipes/zod-validation-pipe';
import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { RegisterUserDto, registerUserSchema } from './dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerUserSchema))
    registerDto: RegisterUserDto,
  ): Promise<User> {
    return this._authService.register(registerDto);
  }
}
