import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { Organization } from './organization.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { OrganizationMembersService } from 'src/organization-members/organization-members.service';
import { OrganizationMember } from 'src/organization-members/organization-member.entity';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OperationTypeEnum, UpdateMembersDto } from './dto/add-members.dto';
import { InviteUserDto } from './dto/Invite-users.dto';
import { InviteUsersService } from 'src/invite-users/invite-users.service';
import { RemoveMembersDto } from './dto/remove-members.dto';

@Injectable()
export class OrganizationsService {
  /**
   * Remove members
   */
  async removeMembers(
    authUser: User,
    organizationId: string,
    removeMembersDto: RemoveMembersDto,
  ) {
    await this.findAndCheckIsOrganizationOwnerOrFail({
      organizationId,
      authUser,
      message:
        'You cannot remove members from organization that is owned by other user',
    });
    await this.organizationMembersService.removeMembers(
      organizationId,
      removeMembersDto.users,
    );
  }

  /**
   * Invite users
   */
  async inviteUsers(
    authUser: User,
    organizationId: string,
    inviteUsersDto: InviteUserDto,
  ) {
    if (authUser.email === inviteUsersDto.email) {
      throw new BadRequestException('You cannot invite your own self');
    }

    await this.findAndCheckIsOrganizationOwnerOrFail({
      authUser,
      organizationId,
    });

    const organizationMember =
      await this.organizationMembersService.findMemberUsingEmail(
        organizationId,
        inviteUsersDto.email,
      );

    if (organizationMember) {
      throw new ConflictException(
        'The user is already a member of the organization',
      );
    }

    await this.inviteUsersService.invite(
      authUser.id,
      inviteUsersDto,
      organizationId,
    );
  }

  /**
   * Cancel Invitation
   */
  async cancelInvitation(
    authUser: User,
    organizationId: string,
    inviteeEmail: string,
  ) {
    await this.findAndCheckIsOrganizationOwnerOrFail({
      authUser,
      organizationId,
    });
    this.inviteUsersService.cancelInvite(organizationId, inviteeEmail);
  }

  /**
   * Delete organization
   */
  delete(organization: Organization) {
    return this.organizationRepo.delete(organization);
  }
  /**
   * Add/Remove members
   */
  async updateMembers(
    authUser: User,
    organizationId: string,
    updateMembersDto: UpdateMembersDto,
  ) {
    await this.findAndCheckIsOrganizationOwnerOrFail({
      authUser,
      organizationId,
      message: 'You cannot update someone elses organization details',
    });

    if (updateMembersDto.operationType === OperationTypeEnum.ADD) {
      await this.organizationMembersService.addMembers(
        organizationId,
        updateMembersDto.users,
      );
    }

    if (updateMembersDto.operationType === OperationTypeEnum.REMOVE) {
      await this.organizationMembersService.removeMembers(
        organizationId,
        updateMembersDto.users,
      );
    }
  }

  /**
   * Update auth user's organization details
   */
  async updateMyOrganization(
    authUser: User,
    organizationId: string,
    data: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.findAndCheckIsOrganizationOwnerOrFail({
      organizationId,
      authUser,
      message: 'You cannot update someone elses organization details',
    });

    return this.organizationRepo.save(
      this.organizationRepo.create({ ...organization, ...data }),
    );
  }

  async updateOrgName(orgId, orgName) {
    const organization = await this.findById(orgId);
    await this.organizationRepo.save({
      ...organization,
      id: orgId,
      name: orgName,
    });
  }

  /**
   * Get organization members
   */
  async getMembers(
    authUser: User,
    organizationId: string,
    options: IPaginationOptions,
  ): Promise<Pagination<OrganizationMember>> {
    await this.findAndCheckIsOrganizationOwnerOrFail({
      authUser,
      organizationId,
      relations: ['user'],
      message: 'This action is unauthorized',
    });

    return this.organizationMembersService.findMembersOfOrganization(
      organizationId,
      options,
    );
  }

  /**
   * Create organization
   */
  create(data: { name: string }) {
    return this.organizationRepo.save(data);
  }

  /**
   * Find by id
   */
  findById(id: number) {
    return this.organizationRepo.findOne(id);
  }

  /**
   * Find one or fail
   */
  async findOneOrFail(
    data: DeepPartial<Organization>,
    relations = [],
  ): Promise<Organization> {
    try {
      return await this.organizationRepo.findOneOrFail({
        where: data,
        relations,
      });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Organization not found!');
      }
      throw error;
    }
  }

  /**
   * - Check if organization exists, if not then @throws {NotFoundException}
   * - Check if user is organization owner, else @throws {ForbiddenException}
   */
  private async findAndCheckIsOrganizationOwnerOrFail(params: {
    organizationId: string;
    authUser: User;
    message?: string;
    relations?: string[];
  }) {
    const organization = await this.organizationRepo.findOneOrFail(
      params.organizationId,
      {
        relations: params.relations,
      },
    );

    if (!organization.isOwner(params.authUser.id)) {
      throw new ForbiddenException(params.message);
    }

    return organization;
  }

  constructor(
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
    private organizationMembersService: OrganizationMembersService,
    private inviteUsersService: InviteUsersService,
  ) {}
}
