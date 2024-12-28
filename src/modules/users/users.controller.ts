import { RequestUser } from '#common/decorators/request-user.decorator';
import { UserProfile } from '#common/types/user-profile.type';
import { JwtUserGuard } from '#modules/auth/guards/jwt-user.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @UseGuards(JwtUserGuard)
  @Get('me')
  getMe(@RequestUser() user: UserProfile): UserProfile {
    return user;
  }
}
