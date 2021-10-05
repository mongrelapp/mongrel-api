import { Module } from '@nestjs/common';
import { PackagesService } from './package.service';
import { PackagesV1Controller } from './controllers/package-v1.controller';
import { KeyValueDatabasesModule } from 'src/key-value-databases/key-value-databases.module';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';

@Module({
  imports: [KeyValueDatabasesModule, ApiKeysModule],
  providers: [PackagesService],
  controllers: [PackagesV1Controller],
})
export class PackagesModule {}
