import { Module } from '@nestjs/common';
import { KeyValueDatabasesModule } from 'src/key-value-databases/key-value-databases.module';
import { DatabasesControllerV1 } from './controllers/databases-v1.controller';

@Module({
  imports: [KeyValueDatabasesModule],
  controllers: [DatabasesControllerV1],
})
export class DatabasesModule {}
