import { UsersModule } from '#modules/users/users.module';
import { UsersRepository } from '#modules/users/users.repository';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtCustomerStrategy } from './guards/strategies/jwt-customer.strategy';
import { LocalUserStrategy } from './guards/strategies/local-user.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    LocalUserStrategy,
    JwtCustomerStrategy,
  ],
})
export class AuthModule {}
