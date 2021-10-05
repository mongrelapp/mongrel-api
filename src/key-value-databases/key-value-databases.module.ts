import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamooseModule } from 'nestjs-dynamoose';
import { KeyValueDatabase } from './key-value-database.entity';
import { MongrelSchema } from './mongrel.schema';
import { KeyValueDatabasesService } from './key-value-databases.service';
import { KeyValueDynamoDatabaseService } from './key-value-dynamo-database.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyValueDatabase]),
    DynamooseModule.forFeature([{ name: 'mongrel', schema: MongrelSchema }]),
  ],
  providers: [KeyValueDatabasesService, KeyValueDynamoDatabaseService],
  exports: [KeyValueDatabasesService, KeyValueDynamoDatabaseService],
})
export class KeyValueDatabasesModule {}
