import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './api-key.entity';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysControllerV1 } from './controllers/api-keys-v1.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
  controllers: [ApiKeysControllerV1],
})
export class ApiKeysModule {}
