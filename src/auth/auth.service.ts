import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { AccessTokenService } from 'src/access-tokens/access-tokens.service';
import { RefreshTokenService } from 'src/refresh-tokens/refresh-tokens.service';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateAuthTokens } from './dto/create-auth-tokens.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { SocialUser } from './interfaces/social-provider-authenticate.interface';
import { SocialProviderFactory } from './social-provider.factory';

@Injectable()
export class AuthService {
  /**
   * Generate Access & Refresh Token in exchange for a Refresh Token
   */
  async createAuthTokensFromRefreshToken(
    authUser: User,
    data: CreateAuthTokens,
  ) {
    const isTokenValid = await this.refreshTokensService.validateRefreshToken(
      authUser.id,
      data.refreshToken,
    );

    if (!isTokenValid)
      throw new BadRequestException(
        'Provided token is either invalid or expired',
      );

    // revoke both tokens
    await Promise.all([
      this.accessTokensService.revokeTokenUsingRefreshToken(data.refreshToken),
      this.refreshTokensService.revokeTokenUsingRefreshToken(data.refreshToken),
    ]);

    return this.generateTokens(authUser);
  }
  /**
   * Logout
   */
  logOut(authUser: User): void {
    Promise.all([
      this.accessTokensService.revokeToken(authUser.jti),
      this.refreshTokensService.revokeTokenUsingJti(authUser.jti),
    ]);
  }

  /**
   * Validate user
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(username, [
      'organization',
    ]);
    if (
      user &&
      !user.socialProvider &&
      (await compare(password, user.password))
    )
      return user;
    return null;
  }

  /**
   * Validate social user
   */
  async validateSocialUser(data: SocialLoginDto): Promise<SocialUser | null> {
    const socialProviderFactory = new SocialProviderFactory();
    const socialProvider = socialProviderFactory.make(data);
    return socialProvider.validate();
  }

  /**
   * Social Login
   */
  async socialLogin(data: SocialLoginDto) {
    const socialUser = await this.validateSocialUser(data);

    if (!socialUser) throw new UnauthorizedException();

    const user = await this.usersService.findOneByEmail(socialUser.email, [
      'organization',
    ]);

    // user already registered with normal email
    if (user && user.socialProvider === null) {
      throw new UnauthorizedException(
        'A normal account already exists with this email address',
      );
    }

    // user already registered with another social provider
    if (
      user &&
      user.socialProvider &&
      user.socialProvider !== data.socialProvider
    ) {
      throw new UnauthorizedException(
        'This email is already linked with another social provider. Try logging with different social provider.',
      );
    }

    if (
      user &&
      (user.stripeCustimerId === null || user.stripeCustimerId === '')
    ) {
      await this.usersService.createStripeCustomer(user);
    }

    // insert
    if (!user) {
      const newUser = await this.usersService.registerUser(socialUser);

      const authenticate = await this.generateTokens(newUser);
      return { user: newUser, authenticate };
    }

    const authenticate = await this.generateTokens(user);
    return { user, authenticate };
  }

  /**
   * Register user
   */
  async registerUser(registerDto: RegisterDto) {
    const checkEmail = await this.usersService.findOneByEmail(
      registerDto.email,
    );

    if (checkEmail)
      throw new ConflictException('An account with this email already exists');

    const user = await this.usersService.registerUser(registerDto);
    const authenticate = await this.generateTokens(user);

    return { user, authenticate };
  }

  /**
   * Generate token
   */
  async generateTokens(user: any) {
    const { decodedToken, jwtToken } =
      await this.accessTokensService.createToken(user);

    const refreshToken = await this.refreshTokensService.createToken(
      decodedToken,
    );

    return {
      accessToken: jwtToken,
      refreshToken,
      expiresAt: decodedToken['exp'],
    };
  }

  constructor(
    private usersService: UsersService,
    private accessTokensService: AccessTokenService,
    private refreshTokensService: RefreshTokenService,
  ) {}
}
