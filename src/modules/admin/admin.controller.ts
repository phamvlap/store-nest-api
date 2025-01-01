import { RequestUser } from '#common/decorators/request-user.decorator';
import { UserProfile } from '#common/types/user-profile.type';
import { JwtAdminGuard } from '#modules/auth/guards/jwt-admin.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('')
export class AdminController {
  @UseGuards(JwtAdminGuard)
  @Get('admin/me')
  getAdminMe(@RequestUser() user: UserProfile): UserProfile {
    return user;
  }
}
