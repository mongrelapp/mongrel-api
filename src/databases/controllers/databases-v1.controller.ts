import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiPaginationQuery } from 'src/common/decorators/api-pagination-query.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { CreateKeyValueDatabaseDto } from 'src/key-value-databases/dto/create-key-value-database.dto';
import { PutDataToKeyValueDatabaseDto } from 'src/key-value-databases/dto/put-data-to-key-value-database.dto';
import { UpdateKeyValueDatabaseDto } from 'src/key-value-databases/dto/update-key-value-database.dto';
import { KeyValueDatabasesService } from 'src/key-value-databases/key-value-databases.service';
import { User } from 'src/users/user.entity';
import { IPaginationResponse } from 'src/common/interfaces/pagination-response.interface';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'databases',
  version: '1',
})
export class DatabasesControllerV1 {
  /**
   * Create key-value database
   */
  @Post('mkv')
  @ApiTags('Key-Value Database Operations')
  @ApiOperation({ summary: 'Create key-value database' })
  async createKeyValueDatabase(
    @AuthUser() authUser: User,
    @Body() createKeyValueDatabaseDto: CreateKeyValueDatabaseDto,
  ) {
    const keyValueDatabase = await this.keyValueDatabasesService.create(
      authUser,
      createKeyValueDatabaseDto,
    );
    return { data: keyValueDatabase };
  }

  /**
   * Get key-value databases of auth user
   */
  @Get('mkv/me')
  @ApiTags('Key-Value Database Operations')
  @ApiOperation({ summary: 'Get key-value databases of auth user' })
  @ApiPaginationQuery()
  async getUserApiKeys(
    @AuthUser() authUser: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    const { items, meta } =
      await this.keyValueDatabasesService.getUserDatabases(authUser, {
        limit: limit > 100 ? 100 : limit,
        page,
      });

    return { data: { items, meta } };
  }

  /**
   * Get key-value database
   */
  @Get('mkv/:keyValueDatabase')
  @ApiTags('Key-Value Database Operations')
  @ApiOperation({ summary: 'Get key-value database' })
  async getDatabase(
    @AuthUser() authUser: User,
    @Param('keyValueDatabase', ParseUUIDPipe) keyValueDatabaseId: string,
  ) {
    const keyValueDatabase = await this.keyValueDatabasesService.getDatabase(
      authUser,
      keyValueDatabaseId,
    );

    return { data: keyValueDatabase };
  }

  /**
   * Update key-value database
   */
  @Put('mkv/:keyValueDatabase')
  @ApiTags('Key-Value Database Operations')
  @ApiOperation({ summary: 'Update key-value database' })
  async updateDb(
    @AuthUser() authUser: User,
    @Body() updateKeyValueDatabaseDto: UpdateKeyValueDatabaseDto,
    @Param('keyValueDatabase', ParseUUIDPipe) keyValueDatabaseId: string,
  ) {
    const keyValueDatabase = await this.keyValueDatabasesService.updateDb(
      authUser,
      keyValueDatabaseId,
      updateKeyValueDatabaseDto,
    );
    return { data: keyValueDatabase };
  }

  /**
   * Drop key-value database
   */
  @Delete('mkv/:keyValueDatabase')
  @ApiTags('Key-Value Database Operations')
  @ApiOperation({ summary: 'Drop key-value database' })
  async dropKeyValueDatabase(
    @AuthUser() authUser: User,
    @Param('keyValueDatabase', ParseUUIDPipe) keyValueDatabaseId: string,
  ) {
    await this.keyValueDatabasesService.dropDatabase(
      authUser,
      keyValueDatabaseId,
    );
    return { message: 'Your database deleted successfully' };
  }

  /**
   * Key-Value - Operation: Put
   */
  @Put('mkv/:keyValueDatabase/put/:key')
  @ApiTags('Key-Value Table Operations')
  @ApiOperation({ summary: 'Put key-value data' })
  @ApiParam({
    name: 'keyValueDatabase',
    description: 'The id of key-value database',
  })
  @ApiParam({
    name: 'key',
    description: 'The key field from the DynamoDB / The sortable key',
  })
  async putDataToKeyValueDatabase(
    @AuthUser() authUser: User,
    @Param('keyValueDatabase', ParseUUIDPipe) keyValueDatabaseId: string,
    @Param('key') key: string,
    @Body() putDataToKeyValueDatabaseDto: PutDataToKeyValueDatabaseDto,
  ) {
    const data = await this.keyValueDatabasesService.put(
      authUser,
      keyValueDatabaseId,
      key,
      putDataToKeyValueDatabaseDto.value,
    );
    return { data: { value: data.value } };
  }

  /**
   * Key-Value - Operation: Find-one
   */
  @Get('mkv/:keyValueDatabase/get/:key')
  @ApiTags('Key-Value Table Operations')
  @ApiOperation({ summary: 'Find-one key-value data' })
  @ApiParam({
    name: 'keyValueDatabase',
    description: 'The id of key-value database',
  })
  @ApiParam({
    name: 'key',
    description: 'The key field from the DynamoDB / The sortable key',
  })
  async findOneKeyValueDatabaseData(
    @AuthUser() authUser: User,
    @Param('keyValueDatabase', ParseUUIDPipe) keyValueDatabaseId: string,
    @Param('key') key: string,
  ) {
    const Item = await this.keyValueDatabasesService.get(
      authUser,
      keyValueDatabaseId,
      key,
    );

    return { data: { value: Item.value } };
  }

  /**
   * Key-Value - Operation: Find-all
   */
  @Get('mkv/:keyValueDatabase/get')
  @ApiTags('Key-Value Table Operations')
  @ApiOperation({ summary: 'Find-all key-value data' })
  @ApiParam({
    name: 'keyValueDatabase',
    description: 'The id of key-value database',
  })
  async findAllKeyValueDatabaseData(
    @AuthUser() authUser: User,
    @Param('keyValueDatabase', ParseUUIDPipe) keyValueDatabaseId: string,
  ): Promise<IPaginationResponse<any>> {
    const data = await this.keyValueDatabasesService.getAll(
      authUser,
      keyValueDatabaseId,
    );

    return {
      data: {
        items: data,
        meta: {
          currentPage: 1,
          totalPages: 1,
          itemCount: data.count,
          totalItems: data.count,
          itemsPerPage: data.count,
        },
      },
    };
  }

  /**
   * Key-Value - Operation: Delete
   */
  @Delete('mkv/:keyValueDatabase/delete/:key')
  @ApiTags('Key-Value Table Operations')
  @ApiOperation({ summary: 'Delete key-value data' })
  @ApiParam({
    name: 'keyValueDatabase',
    description: 'The id of key-value database',
  })
  @ApiParam({
    name: 'key',
    description: 'The key field from the DynamoDB / The sortable key',
  })
  async deleteKeyValueDatabaseData(
    @AuthUser() authUser: User,
    @Param('keyValueDatabase', ParseUUIDPipe) keyValueDatabaseId: string,
    @Param('key') key: string,
  ) {
    await this.keyValueDatabasesService.delete(
      authUser,
      keyValueDatabaseId,
      key,
    );

    return { message: 'Record deleted successfully' };
  }

  /**
   * Key-Value - Operation: Delete all
   */
  @Delete('mkv/:keyValueDatabase/delete')
  @ApiTags('Key-Value Table Operations')
  @ApiOperation({ summary: 'Delete key-value data' })
  @ApiParam({
    name: 'keyValueDatabase',
    description: 'The id of key-value database',
  })
  async deleteAllKeyValueDatabaseData(
    @AuthUser() authUser: User,
    @Param('keyValueDatabase', ParseUUIDPipe) keyValueDatabaseId: string,
  ) {
    await this.keyValueDatabasesService.deleteAll(authUser, keyValueDatabaseId);
    return { message: 'Record deleted successfully' };
  }

  constructor(private keyValueDatabasesService: KeyValueDatabasesService) {}
}
