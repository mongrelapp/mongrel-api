import { Expose, Transform } from 'class-transformer';
import * as moment from 'moment';

export class AuthUserDatabasesDto {
  @Expose({ name: 'id' })
  keyValueDatabaseId: string;

  @Expose()
  lastSuffix: number;

  @Expose()
  tableName: number;

  @Expose()
  size: number;

  @Expose()
  readCount: number;

  @Expose()
  writeCount: number;

  @Expose()
  isActive: boolean;

  @Expose()
  organizationId: string;

  @Transform(({ value }) => moment(value).unix())
  @Expose()
  createdAt: number;
}
