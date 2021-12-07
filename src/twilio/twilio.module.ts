import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [TwilioService],
  exports: [TwilioService],
  controllers: [TwilioController],
})
export class TwilioModule {}
