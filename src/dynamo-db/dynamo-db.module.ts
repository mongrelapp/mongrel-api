import { Module } from '@nestjs/common';
import { DynamoDbService } from './dynamo-db.service';
import { DynamoDbControllerV1 } from './controllers/dynamo-db-v1.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamoDb } from './dynamo-db.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DynamoDb])],
  providers: [DynamoDbService],
  exports: [DynamoDbService],
  controllers: [DynamoDbControllerV1],
})
export class DynamoDbModule {}
