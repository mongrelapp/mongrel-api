import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import TwilioVerifyDto from './dto/twilio-verify.dto';
import CheckVerificationCodeDto from './dto/check-verification-code.dto';
import { UsersService } from '../users/users.service';

@Controller({
  path: 'twilio',
  version: '1',
})
export class TwilioController {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly usersService: UsersService,
  ) {}

  @Post('initiate-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async initiatePhoneNumberVerification(
    @Body() twilioVerifyDto: TwilioVerifyDto,
  ) {
    if (twilioVerifyDto.verified) {
      throw new BadRequestException('Phone number already confirmed');
    }
    await this.usersService.updateUser(twilioVerifyDto);
    return await this.twilioService.initiatePhoneNumberVerification(
      `+${twilioVerifyDto.phoneNumber}`,
    );
  }

  @Post('check-verification-code')
  @UseGuards(JwtAuthGuard)
  async checkVerificationCode(
    @Body() verificationData: CheckVerificationCodeDto,
  ) {
    if (verificationData.verified) {
      throw new BadRequestException('Phone number already confirmed');
    }
    return await this.twilioService.confirmPhoneNumber(
      verificationData.userId,
      `+${verificationData.phoneNumber}`,
      verificationData.code,
    );
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async resendPhoneNumberVerification(@Body() req) {
    return await this.twilioService.initiatePhoneNumberVerification(
      `+${req.phoneNumber}`,
    );
  }
}
