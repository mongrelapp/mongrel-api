import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class ApiKeysService {
  /**
   * Find
   */
  find(where: DeepPartial<ApiKey>, relations = []) {
    return this.apiKeyRepo.findOne({
      where,
      relations,
    });
  }

  /**
   * Get API Keys of auth user
   */
  async getUserApiKeys(
    authUser: any,
    options: IPaginationOptions,
  ): Promise<Pagination<ApiKey>> {
    try {
      const queryBuilder = this.apiKeyRepo
        .createQueryBuilder('a')
        .where('a.userId = :userId', { userId: authUser.id })
        .orderBy('a.id', 'DESC');

      return await paginate<ApiKey>(queryBuilder, options);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Update API Key
   */
  async updateApiKey(
    authUser: User,
    apiKeyId: string,
    updateApiKeyDto: UpdateApiKeyDto,
  ) {
    try {
      const apiKey = await this.findOneAndCheckOwnership(authUser, apiKeyId);
      return this.apiKeyRepo.save(
        this.apiKeyRepo.create({ ...apiKey, ...updateApiKeyDto }),
      );
    } catch (error) {
      this.catchForbiddenExceptionAndThrowNew(
        error,
        'You cannot delete someone elses API Key',
      );

      if (error.name === 'EntityNotFoundError')
        throw new NotFoundException('API Key not found');

      throw new Error();
    }
  }

  /**
   * Delete API Key
   */
  async deleteApiKey(authUser: User, apiKeyId: string) {
    try {
      const apiKey = await this.findOneAndCheckOwnership(authUser, apiKeyId);
      this.apiKeyRepo.remove(apiKey);
    } catch (error) {
      this.catchForbiddenExceptionAndThrowNew(
        error,
        'You cannot delete someone elses API Key',
      );

      if (error.name === 'EntityNotFoundError')
        throw new NotFoundException('API Key not found');

      throw new Error();
    }
  }

  /**
   * Get API Key
   */
  async getApiKey(authUser: User, apiKeyId: string) {
    try {
      return await this.findOneAndCheckOwnership(authUser, apiKeyId);
    } catch (error) {
      this.catchForbiddenExceptionAndThrowNew(error, 'API Key not found');

      if (error.name === 'EntityNotFoundError')
        throw new NotFoundException('API Key not found');

      throw new Error(error);
    }
  }

  /**
   * Create API Key
   */
  createApiKey(
    authUser: User,
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<ApiKey> {
    return this.apiKeyRepo.save(
      this.apiKeyRepo.create({
        ...createApiKeyDto,
        user: authUser,
      }),
    );
  }

  private catchForbiddenExceptionAndThrowNew(error: Error, message?: string) {
    if (error instanceof ForbiddenException) {
      throw new HttpException(message ?? error.message, error.getStatus());
    }
  }

  /**
   * Find one and check ownership or throw exception
   */
  private async findOneAndCheckOwnership(
    authUser: User,
    apiKeyId: string,
  ): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepo.findOneOrFail({
      where: { id: apiKeyId },
      relations: ['user'],
    });

    if (apiKey.user.id !== authUser.id) throw new ForbiddenException();

    return apiKey;
  }

  constructor(
    @InjectRepository(ApiKey) private apiKeyRepo: Repository<ApiKey>,
  ) {}
}
