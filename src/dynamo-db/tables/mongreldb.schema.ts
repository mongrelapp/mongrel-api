import { Attribute, Table } from '@skypress/nestjs-dynamodb';
import { randomInt } from 'crypto';
import * as moment from 'moment';

@Table('mongreldb')
export class MongrelDb {
  @Attribute({
    type: 'String',
    attributeName: 'shard_id',
  })
  shardId: string;

  @Attribute({
    defaultProvider: () => moment().unix().toString(),
    type: 'String',
    attributeName: 'data_id',
  })
  dataId: string;

  @Attribute({
    type: 'Hash',
  })
  data: Record<string, any>;

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

  public static generateShardId(data: {
    organizationId: string;
    tableId: string;
  }): string {
    const { organizationId, tableId } = data;
    return `${organizationId}-${tableId}-${randomInt(1, 10)}`;
  }
}
