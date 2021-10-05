import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Document, InjectModel, Model, QueryResponse } from 'nestjs-dynamoose';
import { Mongrel, MongrelKey } from './mongrel.schema';

@Injectable()
export class KeyValueDynamoDatabaseService {
  /**
   * Get one record
   */
  async get(databaseId: string, key: string) {
    try {
      const item = await this.mongrelModel.get({
        key,
        database_id: databaseId,
      });

      if (!item) throw new NotFoundException('Item not found');

      return item;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all records
   */
  getAll(databaseId: string) {
    return this.mongrelModel.query('database_id').eq(databaseId).all().exec();
  }

  /**
   * Insert/Update record
   */
  async put(
    databaseId: string,
    key: string,
    value: string,
  ): Promise<{ value: string }> {
    try {
      const entity = await this.mongrelModel.get({
        database_id: databaseId,
        key,
      });

      if (!entity) {
        return await this.mongrelModel.create({
          database_id: databaseId,
          key,
          value,
        });
      }

      return await this.mongrelModel.update(
        {
          database_id: databaseId,
          key,
        },
        {
          value,
        },
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete record
   */
  async deleteOne(databaseId: string, key: string) {
    await this.mongrelModel.delete({
      database_id: databaseId,
      key,
    });
  }

  /**
   * Delete all records
   */
  async deleteAll(databaseId: string) {
    try {
      const items = await this.mongrelModel
        .query('database_id')
        .eq(databaseId)
        .limit(25)
        .exec();

      if (items.length) {
        const Promises = items.map(async (item) => {
          return this.mongrelModel.delete({
            database_id: item.database_id,
            key: item.key,
          });
        });

        await Promise.all(Promises);
      }
    } catch (error) {
      throw error;
    }
  }

  constructor(
    @InjectModel('mongrel')
    private mongrelModel: Model<Mongrel, MongrelKey>,
  ) {}
}
