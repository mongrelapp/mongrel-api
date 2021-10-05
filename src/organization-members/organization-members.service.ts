import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import {
  OrganizationMember,
  OrganizationMemberRoleEnum,
} from './organization-member.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class OrganizationMembersService {
  /**
   * Find one
   */
  findOne(where: DeepPartial<OrganizationMember>, relations = []) {
    return this.organizationMemberRepo.findOne({ where, relations });
  }

  /**
   * Add members
   */
  async addMembers(organizationId: string, users: string[]): Promise<void> {
    try {
      const members = await this.usersService.find({ id: In(users) });
      const data: DeepPartial<OrganizationMember>[] = members.map(
        (user: User) => ({
          organization: { id: organizationId },
          user,
        }),
      );

      const [sql, bindings] = this.organizationMemberRepo
        .createQueryBuilder()
        .insert()
        .orIgnore()
        .values(data)
        .getQueryAndParameters();

      await this.organizationMemberRepo.query(sql, bindings);
    } catch (error) {
      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('invalid input syntax for type uuid')
      ) {
        throw new BadRequestException(
          'The body contains one or more invalid uuids',
        );
      }

      throw new Error(error);
    }
  }

  /**
   * Remove members
   * Note: We prevent the owner of the organization ƒrom getting deleted
   */
  async removeMembers(organizationId: string, users: string[]): Promise<void> {
    try {
      await this.organizationMemberRepo
        .createQueryBuilder()
        .delete()
        .where('organizationId = :organizationId', { organizationId })
        .andWhere('role != :role', { role: OrganizationMemberRoleEnum.OWNER })
        .andWhere('userId IN (:...users)', { users })
        .execute();
    } catch (error) {
      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('invalid input syntax for type uuid')
      ) {
        throw new BadRequestException(
          'The body contains one or more invalid uuids',
        );
      }

      throw error;
    }
  }

  /**
   * Save
   */
  save(
    data: DeepPartial<OrganizationMember> | OrganizationMember,
  ): Promise<OrganizationMember> {
    return this.organizationMemberRepo.save(data);
  }

  /**
   * Get all members of my team
   */
  async findMembersOfOrganization(
    organizationId: string,
    options: IPaginationOptions,
  ): Promise<Pagination<OrganizationMember>> {
    const queryBuilder = this.organizationMemberRepo
      .createQueryBuilder('team')
      .innerJoinAndSelect('team.user', 'team-member')
      .innerJoinAndSelect('team.organization', 'team-organization')
      .where('team.organizationId = :organizationId', { organizationId })
      .orderBy('team.createdAt', 'DESC');

    return paginate<OrganizationMember>(queryBuilder, options);
  }

  /**
   * Find member using email
   */
  findMemberUsingEmail(
    organizationId: string,
    email: string,
  ): Promise<OrganizationMember> {
    return this.organizationMemberRepo
      .createQueryBuilder('om')
      .where('om.organizationId = :organizationId', { organizationId })
      .andWhere('omu.email = :email', { email })
      .innerJoin('om.user', 'omu')
      .getOne();
  }

  constructor(
    @InjectRepository(OrganizationMember)
    private organizationMemberRepo: Repository<OrganizationMember>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}
}
