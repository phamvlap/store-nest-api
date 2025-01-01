import { UsersModule } from '#modules/users/users.module';
import { UsersRepository } from '#modules/users/users.repository';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAdminStrategy } from './guards/strategies/jwt-admin.strategy';
import { JwtCustomerStrategy } from './guards/strategies/jwt-customer.strategy';
import { LocalAdminStrategy } from './guards/strategies/local-admin.strategy';
import { LocalCustomerStrategy } from './guards/strategies/local-customer.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    LocalCustomerStrategy,
    LocalAdminStrategy,
    JwtCustomerStrategy,
    JwtAdminStrategy,
  ],
})
export class AuthModule {}
