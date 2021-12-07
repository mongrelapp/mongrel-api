import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindConditions, Repository } from 'typeorm';
import { User } from './user.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { OrganizationMembersService } from 'src/organization-members/organization-members.service';
import { OrganizationMemberRoleEnum } from 'src/organization-members/organization-member.entity';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import TwilioVerifyDto from '../twilio/dto/twilio-verify.dto';

@Injectable()
export class UsersService {
  /**
   * Find
   */
  find(where: FindConditions<User>, relations = []) {
    return this.userRepo.find({ where, relations });
  }

  /**
   * Delete user
   */
  async deleteUser(authUser: User, user: User) {
    if (authUser.id === user.id)
      throw new BadRequestException('You cannot delete your own user');

    await this.userRepo.remove(user);
    await this.organizationsService.delete(user.organization);
  }

  /**
   * Update/Create user
   */
  save(data: User | DeepPartial<User>): Promise<User> {
    return this.userRepo.save(data);
  }

  /**
   * Find one
   */
  findOne(where: FindConditions<User>, relations = []) {
    return this.userRepo.findOne({ where, relations });
  }

  /**
   * Find one or fail
   */
  async findOneOrFail(where: DeepPartial<User>, relations = []): Promise<User> {
    try {
      return await this.userRepo.findOneOrFail({ where, relations });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('User not found!');
      }
      throw new Error(error);
    }
  }

  /**
   * Get all users
   */
  getUsers(options: IPaginationOptions): Promise<Pagination<User>> {
    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC');

    return paginate<User>(queryBuilder, options);
  }

  /**
   * Find one using username
   */
  findOneByEmail(email: string, relations = []) {
    return this.userRepo.findOne({
      where: {
        email,
      },
      relations,
    });
  }

  /**
   * Find by id
   */
  findById(id: number | string) {
    return this.userRepo.findOne(id);
  }

  async createStripeCustomer(user: User) {
    const stripeCustomer = await this.stripeService.createCustomer(
      `${user.firstName} ${user.lastName}`,
      user.email,
    );

    const freeSubscription = await this.stripeService.createSubscription(
      this.configService.get('STRIPE_PROD_FREE'),
      stripeCustomer.id,
    );

    const savedUser = await this.userRepo.save({
      ...user,
      id: user.id,
      stripeCustimerId: stripeCustomer.id,
    });
    console.log(savedUser);
  }

  /**
   * Register user
   * Create Organization
   */
  async registerUser(data: DeepPartial<User>) {
    const organization = await this.organizationsService.create({
      name: data.email,
    });

    // validate email as github account may have not public email.
    const stripeCustomer = await this.stripeService.createCustomer(
      `${data.firstName} ${data.lastName}`,
      data.email,
    );

    const freeSubscription = await this.stripeService.createSubscription(
      this.configService.get('STRIPE_PROD_FREE'),
      stripeCustomer.id,
    );

    const user = await this.userRepo.save(
      this.userRepo.create({
        ...data,
        organization,
        stripeCustimerId: stripeCustomer.id,
      }),
    );

    await this.organizationMembersService.save({
      user,
      organization,
      role: OrganizationMemberRoleEnum.OWNER,
    });

    return user;
  }

  async updateUser(twilioVerifyDto: TwilioVerifyDto) {
    const user = await this.findById(twilioVerifyDto.userId);
    await this.userRepo.save({
      ...user,
      id: user.id,
      phoneNumber: twilioVerifyDto.phoneNumber,
    });

    await this.organizationsService.updateOrgName(
      twilioVerifyDto.orgId,
      twilioVerifyDto.orgName,
    );
  }

  async markPhoneNumberAsConfirmed(userId: string) {
    const user = await this.findById(userId);
    return await this.userRepo.save({
      ...user,
      id: user.id,
      verified: true,
    });
  }

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private organizationsService: OrganizationsService,
    private organizationMembersService: OrganizationMembersService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}
}
