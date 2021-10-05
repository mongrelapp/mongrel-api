import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { classToPlain } from 'class-transformer';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/user.entity';
import { AuthService } from './auth.service';
import { CreateAuthTokens } from './dto/create-auth-tokens.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('Auth')
export class AuthControllerV1 {
  /**
   * Login
   */
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Login user' })
  @ApiConsumes('application/json')
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: any) {
    const authentication = await this.authService.generateTokens(req.user);
    return { data: { ...classToPlain(req.user), authentication } };
  }

  /**
   * Register
   */
  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  async register(@Body() registerDto: RegisterDto) {
    const data = await this.authService.registerUser(registerDto);
    return {
      data: { ...classToPlain(data.user), authenticate: data.authenticate },
    };
  }

  /**
   * Social Login
   */
  @Post('social-login')
  @ApiOperation({ summary: 'Social login' })
  async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    const data = await this.authService.socialLogin(socialLoginDto);
    return {
      data: { ...classToPlain(data.user), authenticate: data.authenticate },
    };
  }

  /**
   * Generate Access & Refresh Token in exchange for a Refresh Token
   */
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Generate Access & Refresh Token in exchange for a Refresh Token',
    description:
      'Access Token is short-lived. While, Refresh Token are long-lived. So, when the Access Token is expired we generate a new pair of both tokens in exchange of a Refresh Token.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createAuthTokensFromRefreshToken(
    @AuthUser() authUser: User,
    @Body() createAuthTokens: CreateAuthTokens,
  ) {
    const data = await this.authService.createAuthTokensFromRefreshToken(
      authUser,
      createAuthTokens,
    );
    return { data };
  }

  /**
   * Logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  async logOut(@AuthUser() authUser: User) {
    this.authService.logOut(authUser);
    return { message: 'User logged out successfully' };
  }

  constructor(private authService: AuthService) {}
}
