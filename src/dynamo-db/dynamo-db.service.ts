import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { DynamoDb } from './dynamo-db.entity';
import slugify from 'slugify';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { CreateDynamoDbDto } from './dto/create-dynamo-database.dto';
import { UpdateDynamoDbDto } from './dto/update-dynamo-db.dto';

@Injectable()
export class DynamoDbService {
  /**
   * Find table or fail
   */
  async findTableOrFail(tableId: string, relations = []) {
    try {
      return await this.dynamoDbRepo.findOneOrFail({
        where: {
          tableId,
        },
        relations,
      });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(error.message);
      }

      throw new Error(error);
    }
  }

  /**
   * Delete database
   */
  async deleteDatabase(authUser: User, dynamoDbId: string): Promise<void> {
    try {
      const dynamoDb = await this.getDatabase(authUser, dynamoDbId);
      await this.dynamoDbRepo.remove(dynamoDb);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new HttpException(
          'You cannot delete someone else database',
          error.getStatus(),
        );
      }

      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user databases
   */
  getUserDatabases(
    authUser: User,
    options: IPaginationOptions,
  ): Promise<Pagination<DynamoDb>> {
    const queryBuilder = this.dynamoDbRepo
      .createQueryBuilder('db')
      .where('db.organizationId = :organizationId', {
        organizationId: authUser.organization.id,
      })
      .orderBy('db.createdAt', 'DESC');

    return paginate<DynamoDb>(queryBuilder, options);
  }

  /**
   * Get database
   */
  async getDatabase(authUser: User, dynamoDbId: string): Promise<DynamoDb> {
    const dynamoDb = await this.findOneOrFail(dynamoDbId, [
      'organization',
      'organization.user',
    ]);

    if (!dynamoDb.organization.isOwner(authUser.id)) {
      throw new ForbiddenException(
        'You cannot retrieve someone else database details',
      );
    }

    return dynamoDb;
  }

  /**
   * Update Dynamo Db
   */
  async updateDb(
    authUser: User,
    dynamoDbId: string,
    updateDynamoDbDto: UpdateDynamoDbDto,
  ) {
    const dynamoDb = await this.findOneOrFail(dynamoDbId, ['organization']);

    if (dynamoDb.organization.id !== authUser.organization.id) {
      throw new ForbiddenException('You cannot update someone elses database');
    }

    const tableId = await this.generateUniqueTableIdSlug(
      updateDynamoDbDto.tableName,
      authUser.organization.id,
    );

    return this.dynamoDbRepo.save(
      this.dynamoDbRepo.create({
        ...dynamoDb,
        ...updateDynamoDbDto,
        // update table_id only if it exist in request
        ...(updateDynamoDbDto.tableName && {
          tableId,
          tableName: updateDynamoDbDto.tableName,
        }),
      }),
    );

    return updateDynamoDbDto;
  }

  /**
   * Find one or fail
   */
  private async findOneOrFail(dynamoDbId: string, relations = []) {
    try {
      return await this.dynamoDbRepo.findOneOrFail(dynamoDbId, { relations });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(error.message);
      }
      throw new Error(error);
    }
  }

  /**
   * Create Dynamo Db
   */
  async createDb(authUser: User, createDynamoDatabaseDto: CreateDynamoDbDto) {
    const tableId = await this.generateUniqueTableIdSlug(
      createDynamoDatabaseDto.tableName,
      authUser.organization.id,
    );

    return this.dynamoDbRepo.save(
      this.dynamoDbRepo.create({
        organization: authUser.organization,
        tableName: createDynamoDatabaseDto.tableName,
        tableId,
      }),
    );
  }

  /**
   * Generate unique slug for table_id field
   */
  private async generateUniqueTableIdSlug(
    tableName: string,
    organizationId: string,
  ): Promise<string> {
    let tableId = slugify(tableName.replace('_', ' '), {
      trim: true,
      lower: true,
      replacement: '-',
    });

    const checkTableIdExist = await this.dynamoDbRepo
      .createQueryBuilder('db')
      .where('db.organizationId = :organizationId', {
        organizationId,
      })
      .andWhere('db.tableId LIKE :tableId', {
        tableId: `${tableId}%`,
      })
      .orderBy('db.createdAt', 'DESC')
      .getOne();

    if (checkTableIdExist) {
      // For eg: tableName = "awesome-database-4"
      // We retrieve the last number and increment it by +1
      // and save to database
      const [getLastIncrementedNumber] = checkTableIdExist.tableId
        .split('-')
        .reverse();

      if (!isNaN(parseInt(getLastIncrementedNumber))) {
        const slugPostfix = parseInt(getLastIncrementedNumber) + 1;
        tableId = `${tableId}-${slugPostfix}`;
      } else {
        tableId = `${tableId}-${1}`;
      }
    }

    return tableId;
  }

  constructor(
    @InjectRepository(DynamoDb) private dynamoDbRepo: Repository<DynamoDb>,
  ) {}
}
