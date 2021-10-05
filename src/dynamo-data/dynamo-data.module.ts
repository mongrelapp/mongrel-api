import { Module } from '@nestjs/common';
import { DynamoDataService } from './dynamo-data.service';
import { DynamoDataController } from './dynamo-data.controller';
import { DynamoDbModule } from 'src/dynamo-db/dynamo-db.module';
import { DynamoDBModule } from '@skypress/nestjs-dynamodb';
import { MongrelDb } from 'src/dynamo-db/tables/mongreldb.schema';

@Module({
  imports: [DynamoDbModule, DynamoDBModule.forFeature([MongrelDb])],
  providers: [DynamoDataService],
  controllers: [DynamoDataController],
})
export class DynamoDataModule {}
