import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
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
import { classToPlain } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiPaginationQuery } from 'src/common/decorators/api-pagination-query.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../user.entity';
import { UsersService } from '../users.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { validateEmail } from '../../utils';

@Controller({
  path: 'users',
  version: '1',
})
@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersControllerV1 {
  constructor(
    private usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Get all users
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiPaginationQuery()
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    const { items, meta } = await this.usersService.getUsers({
      limit: limit > 100 ? 100 : limit,
      page,
    });

    return { data: { items: classToPlain(items), meta } };
  }

  /**
   * Get user
   */
  @Get(':user')
  @ApiOperation({ summary: 'Get user' })
  @ApiParam({ name: 'user', description: 'The id of the user' })
  async getUser(@Param('user', ParseUUIDPipe) userId: string) {
    const user = await this.usersService.findOneOrFail({ id: userId }, [
      'organization',
    ]);
    const { data: subscription } =
      validateEmail(user.email) &&
      (await this.subscriptionsService.currentSubscription(
        user.stripeCustimerId,
      ));
    return { data: { ...user, subscription: subscription } };
  }

  /**
   * Update user
   */
  @Put(':user')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'user', description: 'The id of the user1' })
  async updateUser(
    @Param('user', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    let user = await this.usersService.findOneOrFail({ id: userId }, [
      'organization',
    ]);
    user = await this.usersService.save({ ...user, ...updateUserDto });
    return { data: user };
  }

  /**
   * Delete user
   */
  @Delete(':user')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'user', description: 'The id of the user1' })
  async deleteUser(
    @AuthUser() authUser: User,
    @Param('user', ParseUUIDPipe) userId: string,
  ) {
    const user = await this.usersService.findOneOrFail({ id: userId }, [
      'organization',
    ]);
    await this.usersService.deleteUser(authUser, user);
    return { message: 'User deleted successfully' };
  }
}
