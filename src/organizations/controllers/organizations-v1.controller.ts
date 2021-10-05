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
import { User } from 'src/users/user.entity';
import { UpdateMembersDto } from '../dto/add-members.dto';
import { CancelInviteDto } from '../dto/cancel-invite.dt';
import { InviteUserDto } from '../dto/Invite-users.dto';
import { RemoveMembersDto } from '../dto/remove-members.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationsService } from '../organizations.service';

@Controller({
  path: 'organizations',
  version: '1',
})
@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrganizationsControllerV1 {
  /**
   * Get organization members
   */
  @Get(':organization/members')
  @ApiOperation({ summary: 'Get organization members' })
  @ApiParam({ name: 'organization', description: 'The id of the user' })
  @ApiPaginationQuery()
  async getMembers(
    @AuthUser() authUser: User,
    @Param('organization', ParseUUIDPipe) organizationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    const { items, meta } = await this.organizationsService.getMembers(
      authUser,
      organizationId,
      {
        limit: limit > 100 ? 100 : limit,
        page,
      },
    );

    return {
      data: {
        items: classToPlain(items),
        meta: meta,
      },
    };
  }

  /**
   * Update organization members
   */
  @Put(':organization/members')
  @ApiOperation({
    summary: 'Update organization members: Add/Remove members',
    deprecated: true,
  })
  @ApiParam({ name: 'organization', description: 'The id of the organization' })
  async updateMembers(
    @AuthUser() authUser: User,
    @Body() updateMembersDto: UpdateMembersDto,
    @Param('organization', ParseUUIDPipe) organizationId: string,
  ) {
    await this.organizationsService.updateMembers(
      authUser,
      organizationId,
      updateMembersDto,
    );

    return { message: 'Members updated successfully' };
  }

  /**
   * Remove organization members
   */
  @Delete(':organization/members')
  @ApiOperation({
    summary: 'Remove organization members',
  })
  @ApiParam({ name: 'organization', description: 'The id of the organization' })
  async removeMembers(
    @AuthUser() authUser: User,
    @Body() removeMembersDto: RemoveMembersDto,
    @Param('organization', ParseUUIDPipe) organizationId: string,
  ) {
    await this.organizationsService.removeMembers(
      authUser,
      organizationId,
      removeMembersDto,
    );

    return { message: 'Members removed successfully' };
  }

  /**
   * Invite users
   */
  @Put(':organization/invite-users')
  @ApiOperation({
    summary: 'Invite users',
  })
  @ApiParam({ name: 'organization', description: 'The id of the organization' })
  async inviteUsers(
    @AuthUser() authUser: User,
    @Param('organization', ParseUUIDPipe) organizationId: string,
    @Body() inviteUsersDto: InviteUserDto,
  ) {
    await this.organizationsService.inviteUsers(
      authUser,
      organizationId,
      inviteUsersDto,
    );
    return { message: 'Users invited successfully' };
  }

  /**
   * Cancel invitation
   */
  @Put(':organization/cancel-invite')
  @ApiOperation({ summary: 'Cancel Invite' })
  @ApiParam({ name: 'organization', description: 'The id of the organization' })
  async cancelInvite(
    @AuthUser() authUser: User,
    @Param('organization', ParseUUIDPipe) organizationId: string,
    @Body() cancelInviteDto: CancelInviteDto,
  ) {
    await this.organizationsService.cancelInvitation(
      authUser,
      organizationId,
      cancelInviteDto.email,
    );
    return { message: 'Invitation cancelled successfully' };
  }

  /**
   * Update auth user's organization details
   */
  @Put(':organization')
  @ApiOperation({ summary: "Update auth user's organization details" })
  @ApiParam({ name: 'organization', description: 'The id of the organization' })
  async update(
    @AuthUser() authUser: User,
    @Param('organization', ParseUUIDPipe) organizationId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    const organization = await this.organizationsService.updateMyOrganization(
      authUser,
      organizationId,
      updateOrganizationDto,
    );

    return { data: organization };
  }

  constructor(private organizationsService: OrganizationsService) {}
}
