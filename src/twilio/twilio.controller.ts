import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import TwilioVerifyDto from './dto/twilio-verify.dto';
import CheckVerificationCodeDto from './dto/check-verification-code.dto';
import { UsersService } from '../users/users.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MessagingResponse = require('twilio').twiml.MessagingResponse;

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

  @Post('sms-reply')
  async receiveSMS(@Request() req: any, @Res() res: any) {
    const twiml = new MessagingResponse();
    console.log(`Incoming message from ${req.body.From}: ${req.body.Body}`);
    twiml.message('Thanks for using Mongrel ❤, Please reply your email.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
}
