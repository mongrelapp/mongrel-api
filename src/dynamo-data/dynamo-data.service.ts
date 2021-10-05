import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel, ReturnModel } from '@skypress/nestjs-dynamodb';
import { DynamoDb } from 'src/dynamo-db/dynamo-db.entity';
import { DynamoDbService } from 'src/dynamo-db/dynamo-db.service';
import { MongrelDb } from 'src/dynamo-db/tables/mongreldb.schema';
import { User } from 'src/users/user.entity';
import { InsertDataDto } from './dto/insert-data.dto';

const MongrelDbType = ReturnModel<MongrelDb>();

@Injectable()
export class DynamoDataService {
  /**
   * Insert data to Dynamo DB
   */
  async insertData(
    authUser: User,
    tableId: string,
    InsertDataDto: InsertDataDto,
  ) {
    const table: DynamoDb = await this.dynamoDbService.findTableOrFail(
      tableId,
      ['organization'],
    );

    if (!table.isTableOwner(authUser.organization.id)) {
      throw new ForbiddenException(
        'You cannot perform operations against other users database',
      );
    }

    return this.mongrelDb.create({
      data: InsertDataDto.data,
      shardId: MongrelDb.generateShardId({
        organizationId: authUser.organization.id,
        tableId,
      }),
    });
  }

  constructor(
    @InjectModel(MongrelDb)
    private readonly mongrelDb: typeof MongrelDbType,
    private dynamoDbService: DynamoDbService,
  ) {}
}
