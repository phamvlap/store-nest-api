import { RequestUser } from '#common/decorators/request-user.decorator';
import { UserProfile } from '#common/types/user-profile.type';
import { JwtCustomerGuard } from '#modules/auth/guards/jwt-customer.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @UseGuards(JwtCustomerGuard)
  @Get('me')
  getMe(@RequestUser() user: UserProfile): UserProfile {
    return user;
  }
}
