import { Module } from '@nestjs/common';
import { CollectEmailController } from './collect-email.controller';
import { CollectEmailService } from './collect-email.service';

@Module({
  controllers: [CollectEmailController],
  providers: [CollectEmailService]
})
export class CollectEmailModule {}
