import { UsersModule } from '#modules/users/users.module';
import { UsersRepository } from '#modules/users/users.repository';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository],
})
export class AuthModule {}
