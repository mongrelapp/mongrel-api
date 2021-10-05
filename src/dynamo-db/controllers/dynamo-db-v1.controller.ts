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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { classToPlain } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiPaginationQuery } from 'src/common/decorators/api-pagination-query.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/user.entity';
import { CreateDynamoDbDto } from '../dto/create-dynamo-database.dto';
import { UpdateDynamoDbDto } from '../dto/update-dynamo-db.dto';
import { DynamoDbService } from '../dynamo-db.service';

@Controller({
  path: 'dynamo-db',
  version: '1',
})
@ApiTags('Dynamo DB')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DynamoDbControllerV1 {
  /**
   * Get databases of auth user
   */
  @Get('me')
  @ApiOperation({ summary: 'Get databases of auth user' })
  @ApiPaginationQuery()
  async getUserApiKeys(
    @AuthUser() authUser: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    const { items, meta } = await this.dynamoDbService.getUserDatabases(
      authUser,
      {
        limit: limit > 100 ? 100 : limit,
        page,
      },
    );

    return { data: { items: classToPlain(items), meta } };
  }

  /**
   * Get database
   */
  @Get(':dynamoDb')
  @ApiOperation({ summary: 'Get database' })
  async getDatabase(
    @AuthUser() authUser: User,
    @Param('dynamoDb', ParseUUIDPipe) dynamoDbId: string,
  ) {
    const dynamoDb = await this.dynamoDbService.getDatabase(
      authUser,
      dynamoDbId,
    );

    return { data: dynamoDb };
  }

  /**
   * Create database
   */
  @Post()
  @ApiOperation({ summary: 'Create database' })
  async createDb(
    @AuthUser() authUser: User,
    @Body() createDynamoDatabaseDto: CreateDynamoDbDto,
  ) {
    const dynamoDb = await this.dynamoDbService.createDb(
      authUser,
      createDynamoDatabaseDto,
    );
    return { data: dynamoDb };
  }

  /**
   * Update database
   */
  @Put(':dynamoDb')
  @ApiOperation({ summary: 'Update database' })
  async updateDb(
    @AuthUser() authUser: User,
    @Body() updateDynamoDb: UpdateDynamoDbDto,
    @Param('dynamoDb', ParseUUIDPipe) dynamoDbId: string,
  ) {
    const dynamoDb = await this.dynamoDbService.updateDb(
      authUser,
      dynamoDbId,
      updateDynamoDb,
    );
    return { data: dynamoDb };
  }

  /**
   * Delete database
   */
  @Delete(':dynamoDb')
  @ApiOperation({ summary: 'Delete database' })
  async deleteDatabase(
    @AuthUser() authUser: User,
    @Param('dynamoDb', ParseUUIDPipe) dynamoDbId: string,
  ) {
    await this.dynamoDbService.deleteDatabase(authUser, dynamoDbId);
    return { message: 'Your database deleted successfully' };
  }

  constructor(private dynamoDbService: DynamoDbService) {}
}
