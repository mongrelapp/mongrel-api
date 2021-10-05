import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiNpmPackageAuth } from 'src/common/decorators/api-npm-package-auth.decorator';
import {
  IPackageConsumer,
  PackageConsumer,
} from 'src/common/decorators/package-consumer.decorator';
import { PackageConsumerGuard } from 'src/common/guards/package-consumer.guard';
import { PutDataToKeyValueDatabaseDto } from 'src/key-value-databases/dto/put-data-to-key-value-database.dto';
import { KeyValueDynamoDatabaseService } from 'src/key-value-databases/key-value-dynamo-database.service';

@Controller({
  path: 'package',
  version: '1',
})
@ApiTags('NPM Package')
@ApiNpmPackageAuth()
@UseGuards(PackageConsumerGuard)
export class PackagesV1Controller {
  /**
   * Insert/Update
   */
  @Put(':key')
  @ApiOperation({ summary: 'Insert/Update item' })
  @ApiParam({ name: 'key' })
  async put(
    @PackageConsumer() packageConsumer: IPackageConsumer,
    @Body() data: PutDataToKeyValueDatabaseDto,
    @Param('key') key: string,
  ) {
    const record = await this.keyValueDynamoDatabaseService.put(
      packageConsumer.databaseId,
      key,
      data.value,
    );

    return {
      value: record.value,
    };
  }

  /**
   * Get item
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get item' })
  @ApiParam({ name: 'key' })
  async get(
    @PackageConsumer() packageConsumer: IPackageConsumer,
    @Param('key') key: string,
  ) {
    const record = await this.keyValueDynamoDatabaseService.get(
      packageConsumer.databaseId,
      key,
    );
    return record?.value ? { value: record.value } : {};
  }

  /**
   * Delete item
   */
  @Delete(':key')
  @ApiOperation({
    summary: 'Delete item',
  })
  @ApiParam({ name: 'key' })
  async delete(
    @PackageConsumer() packageConsumer: IPackageConsumer,
    @Param('key') key: string,
  ) {
    await this.keyValueDynamoDatabaseService.deleteOne(
      packageConsumer.databaseId,
      key,
    );
    return { message: 'Record deleted successfully' };
  }

  constructor(
    private keyValueDynamoDatabaseService: KeyValueDynamoDatabaseService,
  ) {}
}
