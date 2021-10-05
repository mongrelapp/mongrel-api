import { Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
  } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/user.entity';
import { SubscriptionsService } from './subscriptions.service';

@Controller({
  path: 'subscriptions',
  version: '1',
})
@ApiTags('Subscriptions')
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService
  ) {}

  @Get('change')
  @UseGuards(JwtAuthGuard)
  async changeSubscription(
    @AuthUser() authUser: User,
    ) {
      return this.subscriptionsService.changeSubscription(authUser.stripeCustimerId);      
  }

  @Post('monthly')
  @UseGuards(JwtAuthGuard)
  async createMonthlySubscription(
    @AuthUser() authUser: User,
    ) {
    return this.subscriptionsService.createMonthlySubscription(authUser.stripeCustimerId);
  }

  @Get('monthly')
  @UseGuards(JwtAuthGuard)
  async getMonthlySubscription(
    @AuthUser() authUser: User,
    ) {
    return this.subscriptionsService.getMonthlySubscription(authUser.stripeCustimerId);
  }
}