import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import {
  createPaginationObject,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { CreateKeyValueDatabaseDto } from 'src/key-value-databases/dto/create-key-value-database.dto';
import { UpdateKeyValueDatabaseDto } from 'src/key-value-databases/dto/update-key-value-database.dto';
import { OrganizationMemberRoleEnum } from 'src/organization-members/organization-member.entity';
import { User } from 'src/users/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { AuthUserDatabasesDto } from './dto/auth-user-databases.dto';
import { KeyValueDatabase } from './key-value-database.entity';
import { KeyValueDynamoDatabaseService } from './key-value-dynamo-database.service';

@Injectable()
export class KeyValueDatabasesService {
  /**
   * Create Database
   */
  async create(authUser: User, data: CreateKeyValueDatabaseDto) {
    return this.keyValueDatabaseRepo.save(
      this.keyValueDatabaseRepo.create({
        organization: authUser.organization,
        tableName: data.tableName,
      }),
    );
  }

  /**
   * Find
   */
  find(where: DeepPartial<KeyValueDatabase>, relations = []) {
    return this.keyValueDatabaseRepo.findOneOrFail({
      where,
      relations,
    });
  }

  /**
   * Find table or fail
   */
  async findTableOrFail(keyValueDatabaseId: string, relations = []) {
    try {
      return await this.keyValueDatabaseRepo.findOneOrFail({
        where: {
          id: keyValueDatabaseId,
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
  async dropDatabase(
    authUser: User,
    keyValueDatabaseId: string,
  ): Promise<void> {
    try {
      const keyValueDatabase = await this.getDatabase(
        authUser,
        keyValueDatabaseId,
      );
      await this.keyValueDatabaseRepo.remove(keyValueDatabase);
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
   * Get user's (own + shared) databases
   */
  async getUserDatabases(authUser: User, options: IPaginationOptions) {
    const offset: number =
      Number(options.page) * Number(options.limit) - Number(options.limit);

    const [sql, bindings] = [
      `
      (
        SELECT * FROM "key_value_database" "kv"
        WHERE "kv"."organizationId" = $1
      ) UNION (
        SELECT "kv".* FROM "key_value_database" "kv"
        INNER JOIN organization_member AS "om" ON "kv"."organizationId" = "om"."organizationId"
        INNER JOIN organization AS "o" ON "om"."organizationId" = "o"."id"
        WHERE "om"."userId" = $2 AND "om"."role" = $3
      )`,
      [authUser.organization.id, authUser.id, OrganizationMemberRoleEnum.USER],
    ];

    const [{ aggregate: totalItems }] = await this.keyValueDatabaseRepo.query(
      `SELECT COUNT(*) AS aggregate FROM (${sql}) AS "t"`,
      bindings,
    );

    const items: [] = await this.keyValueDatabaseRepo.query(
      `SELECT * FROM (${sql}) AS "t"
      ORDER BY "t"."organizationId" DESC
      OFFSET $4 LIMIT $5`,
      [...bindings, offset, options.limit],
    );

    return createPaginationObject({
      items: plainToClass(AuthUserDatabasesDto, items, {
        excludeExtraneousValues: true,
      }),
      currentPage: Number(options.page),
      totalItems: Number(totalItems),
      limit: Number(options.limit),
    });
  }

  /**
   * Get database
   */
  getDatabase(
    authUser: User,
    keyValueDatabaseId: string,
  ): Promise<KeyValueDatabase> {
    return this.checkIsOrganizationOwnerOrFail({
      authUser,
      keyValueDatabaseId,
      message: 'You cannot retrieve someone else database details',
    });
  }

  /**
   * Update database
   */
  async updateDb(
    authUser: User,
    keyValueDatabaseId: string,
    keyValueDatabaseDto: UpdateKeyValueDatabaseDto,
  ) {
    const keyValueDatabase = await this.checkIsOrganizationOwnerOrFail({
      keyValueDatabaseId,
      authUser,
    });

    return this.keyValueDatabaseRepo.save(
      this.keyValueDatabaseRepo.create({
        ...keyValueDatabase,
        ...keyValueDatabaseDto,
        // update table_name only if it exist in request
        ...(keyValueDatabaseDto.tableName && {
          tableName: keyValueDatabaseDto.tableName,
        }),
      }),
    );
  }

  /**
   * Get single record
   */
  async get(authUser: User, keyValueDatabaseId: string, key: string) {
    const table: KeyValueDatabase =
      await this.checkIsTableOwnerAndHasSharedAccess({
        keyValueDatabaseId,
        authUser,
        message: 'You cannot perform operations against other users database',
      });
    return this.keyValueDynamoDatabaseService.get(table.id, key);
  }

  /**
   * Get single record
   */
  async getAll(authUser: User, keyValueDatabaseId: string) {
    const table: KeyValueDatabase =
      await this.checkIsTableOwnerAndHasSharedAccess({
        authUser,
        keyValueDatabaseId,
        message: 'You cannot perform operations against other users database',
      });

    return this.keyValueDynamoDatabaseService.getAll(table.id);
  }

  /**
   * Upsert record
   */
  async put(
    authUser: User,
    keyValueDatabaseId: string,
    key: string,
    value: string,
  ) {
    const table: KeyValueDatabase =
      await this.checkIsTableOwnerAndHasSharedAccess({
        authUser,
        keyValueDatabaseId,
        message: 'You cannot perform operations against other users database',
      });

    return this.keyValueDynamoDatabaseService.put(table.id, key, value);
  }

  /**
   * Delete Record
   */
  async delete(authUser: User, keyValueDatabaseId: string, key: string) {
    const table: KeyValueDatabase =
      await this.checkIsTableOwnerAndHasSharedAccess({
        authUser,
        keyValueDatabaseId,
        message: 'You cannot perform operations against other users database',
      });

    this.keyValueDynamoDatabaseService.deleteOne(table.id, key);
  }

  /**
   * Delete-all Records
   */
  async deleteAll(authUser: User, keyValueDatabaseId: string) {
    const table: KeyValueDatabase =
      await this.checkIsTableOwnerAndHasSharedAccess({
        authUser,
        keyValueDatabaseId,
        message: 'You cannot perform operations against other users database',
      });

    this.keyValueDynamoDatabaseService.deleteAll(table.id);
  }

  /**
   * Find one or fail
   */
  private async findOneOrFail(keyValueDatabaseId: string, relations = []) {
    try {
      return await this.keyValueDatabaseRepo.findOneOrFail(keyValueDatabaseId, {
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
   * Check if user has shared database access
   */
  private async hasSharedAccessToDatabase(
    databaseId: string,
    userId: string,
  ): Promise<boolean> {
    return (
      (await this.keyValueDatabaseRepo
        .createQueryBuilder('kv')
        .innerJoin('kv.organization', 'o')
        .innerJoin('o.organizationMembers', 'om')
        .where('om.userId = :userId', { userId })
        .andWhere('kv.id = :databaseId', { databaseId })
        .getCount()) > 0
    );
  }

  /**
   * Conditions
   * - Check if supplied user is table owner
   * - Check if user has shared access to table
   */
  private async checkIsTableOwnerAndHasSharedAccess(params: {
    keyValueDatabaseId: string;
    authUser: User;
    message?: string;
  }) {
    const { authUser, keyValueDatabaseId, message } = params;
    const table: KeyValueDatabase = await this.findTableOrFail(
      keyValueDatabaseId,
      ['organization'],
    );

    if (
      !table.isTableOwner(authUser.organization.id) &&
      !(await this.hasSharedAccessToDatabase(keyValueDatabaseId, authUser.id))
    ) {
      throw new ForbiddenException(message);
    }

    return table;
  }

  /**
   * Check if supplied user is organization owner
   */
  private async checkIsOrganizationOwnerOrFail(params: {
    keyValueDatabaseId: string;
    authUser: User;
    message?: string;
  }) {
    const keyValueDatabase = await this.findOneOrFail(
      params.keyValueDatabaseId,
      ['organization'],
    );

    if (keyValueDatabase.organization.id !== params.authUser.organization.id) {
      throw new ForbiddenException(
        params.message ?? 'This action is unauthorized',
      );
    }

    return keyValueDatabase;
  }

  constructor(
    @InjectRepository(KeyValueDatabase)
    private keyValueDatabaseRepo: Repository<KeyValueDatabase>,
    private keyValueDynamoDatabaseService: KeyValueDynamoDatabaseService,
  ) {}
}
