import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthControllerV1 } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AccessTokensModule } from 'src/access-tokens/access-tokens.module';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-tokens.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '360 days',
        },
      }),
      inject: [ConfigService],
    }),
    AccessTokensModule,
    RefreshTokensModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthControllerV1],
})
export class AuthModule {}
