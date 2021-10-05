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
import { ApiKeysService } from '../api-keys.service';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { UpdateApiKeyDto } from '../dto/update-api-key.dto';

@Controller({
  path: 'api-keys',
  version: '1',
})
@ApiTags('API Key')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ApiKeysControllerV1 {
  /**
   * Get api keys of auth user
   */
  @Get('me')
  @ApiOperation({ summary: 'Get api keys of auth user' })
  @ApiPaginationQuery()
  async getUserApiKeys(
    @AuthUser() authUser: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    const { items, meta } = await this.apiKeysService.getUserApiKeys(authUser, {
      limit: limit > 100 ? 100 : limit,
      page,
    });

    return { data: { items: classToPlain(items), meta } };
  }

  /**
   * Save API Key
   */
  @Post()
  @ApiOperation({ summary: 'Save API Key' })
  async createApiKey(
    @AuthUser() authUser: User,
    @Body() createApiKeyDto: CreateApiKeyDto,
  ) {
    const apiKey = await this.apiKeysService.createApiKey(
      authUser,
      createApiKeyDto,
    );
    return { data: apiKey };
  }

  /**
   * Delete API Key
   */
  @Delete(':apiKey')
  @ApiOperation({ summary: 'Delete API Key' })
  async deleteApiKey(
    @AuthUser() authUser: User,
    @Param('apiKey', new ParseUUIDPipe()) apiKeyId: string,
  ) {
    await this.apiKeysService.deleteApiKey(authUser, apiKeyId);
    return { message: 'Api Key deleted successfully' };
  }

  /**
   * Update API Key
   */
  @Put(':apiKey')
  @ApiOperation({ summary: 'Update API Key' })
  async updateApiKey(
    @AuthUser() authUser: User,
    @Param('apiKey', ParseUUIDPipe) apiKeyId: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
  ) {
    const apiKey = await this.apiKeysService.updateApiKey(
      authUser,
      apiKeyId,
      updateApiKeyDto,
    );
    return { data: apiKey };
  }

  /**
   * Get API Key
   */
  @Get(':apiKey')
  @ApiOperation({ summary: 'Detail API Key' })
  async getApiKey(
    @AuthUser() authUser: User,
    @Param('apiKey', ParseUUIDPipe) apiKeyId: string,
  ) {
    const apiKey = await this.apiKeysService.getApiKey(authUser, apiKeyId);
    return { data: apiKey };
  }

  constructor(private apiKeysService: ApiKeysService) {}
}
