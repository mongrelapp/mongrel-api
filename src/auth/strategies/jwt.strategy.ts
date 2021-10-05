import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { AccessTokenService } from 'src/access-tokens/access-tokens.service';
import { AccessToken } from 'src/access-tokens/access-token.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private accessTokensService: AccessTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    const accessToken = await this.accessTokensService.findOne(payload.jti);

    if (
      !accessToken ||
      accessToken.revoked === AccessToken.REVOKE_TOKEN ||
      Date.now() > accessToken.expiresAt.getTime()
    ) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findOneByEmail(payload.username, [
      'organization',
    ]);

    if (!user) throw new UnauthorizedException();

    user.jti = payload.jti;
    return user;
  }
}
