import { Module } from '@nestjs/common';
import { CollectKeywordsService } from './collect-keywords.service';
import { CollectKeywordsController } from './collect-keywords.controller';

@Module({
  providers: [CollectKeywordsService],
  controllers: [CollectKeywordsController]
})
export class CollectKeywordsModule {}
