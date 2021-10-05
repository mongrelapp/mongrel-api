import { Attribute, Table } from '@skypress/nestjs-dynamodb';
import { config } from 'dotenv';
config();

const tableName = process.env.DYNAMODB_DATABASE;

@Table(tableName)
export class DynamoKeyValueDatabase {
  @Attribute({
    type: 'String',
    attributeName: 'database_id',
  })
  databaseId: string;

  @Attribute({
    type: 'String',
  })
  key: string;

  @Attribute({
    type: 'String',
  })
  value: string;

  @Attribute({
    defaultProvider: () => true,
    type: 'Boolean',
    attributeName: 'is_active',
  })
  isActive: boolean;

  @Attribute({
    defaultProvider: () => new Date(),
    type: 'Date',
    attributeName: 'created_at',
  })
  createdAt: Date;

  @Attribute({
    defaultProvider: () => new Date(),
    type: 'Date',
    attributeName: 'updated_at',
  })
  updatedAt: Date;
}
