import { UsersModule } from '#modules/users/users.module';
import { UsersRepository } from '#modules/users/users.repository';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalUserStrategy } from './guards/strategies/local-user.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY as string,
      signOptions: {},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, LocalUserStrategy],
})
export class AuthModule {}
