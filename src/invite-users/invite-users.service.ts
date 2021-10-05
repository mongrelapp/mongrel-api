import {
  forwardRef,
  GoneException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import * as moment from 'moment';
import { UserInvitedEvent } from 'src/invite-users/events/user-invited.event';
import { OrganizationMembersService } from 'src/organization-members/organization-members.service';
import { InviteUserDto } from 'src/organizations/dto/Invite-users.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { DeepPartial, Repository } from 'typeorm';
import { InviteUser } from './invite-user.entity';

@Injectable()
export class InviteUsersService {
  /**
   * Get pending invitations
   */
  getPendingInvitations(authUser: User) {
    return this.inviteUserRepo
      .createQueryBuilder('iu')
      .where('iu.inviterId = :inviterId', { inviterId: authUser.id })
      .getMany();
  }

  /**
   * Verify Token
   * Save user to database
   */
  async verifyToken(token: string) {
    const entity = await this.inviteUserRepo.findOne({
      where: {
        token,
      },
      relations: ['organization'],
    });

    if (!entity || new Date() > entity.expiresAt)
      throw new GoneException('The link is invalid or expired');

    const user = await this.usersService.findOneByEmail(entity.inviteeEmail, [
      'organization',
    ]);

    if (!user) throw new UnauthorizedException();

    await this.organizationMembersService.addMembers(entity.organization.id, [
      user.id,
    ]);
    await this.inviteUserRepo.remove(entity);
  }
  /**
   * Cancel invitation
   */
  cancelInvite(organizationId: string, inviteeEmail: string) {
    this.inviteUserRepo.delete({
      inviteeEmail,
      organization: { id: organizationId },
    });
  }

  /**
   * Find one
   */
  findOne(where: DeepPartial<InviteUser>, relations = []) {
    return this.inviteUserRepo.findOne({ where, relations });
  }

  /**
   * Invite user
   */
  async invite(inviterId: string, data: InviteUserDto, organizationId: string) {
    const alreadyInvited = await this.inviteUserRepo
      .createQueryBuilder('iu')
      .where('iu.inviteeEmail = :inviteeEmail', { inviteeEmail: data.email })
      .andWhere('iu.organizationId = :organizationId', {
        organizationId,
      })
      .innerJoinAndSelect('iu.inviter', 'inviter')
      .innerJoinAndSelect('iu.organization', 'organization')
      .getOne();

    if (alreadyInvited) {
      return this.extendTokenTimeAndResendEmail(alreadyInvited);
    } else {
      return this.createAndSendEmail(inviterId, data, organizationId);
    }
  }

  /**
   * Save invitation in database
   * Send Email
   */
  private async createAndSendEmail(
    inviterId: string,
    inviteUserDto: InviteUserDto,
    organizationId: string,
  ) {
    const entity = this.inviteUserRepo.create({
      inviteeEmail: inviteUserDto.email,
      inviteeFirstName: inviteUserDto.firstName,
      inviteeLastName: inviteUserDto.lastName,
      inviter: { id: inviterId },
      organization: { id: organizationId },
      expiresAt: moment().add(24, 'hours').toDate(),
      token: randomBytes(32).toString('hex'),
    });

    let inviteUser = await this.inviteUserRepo.save(entity);
    inviteUser = await this.reload(entity);

    this.dispatchUserInvitedEvent(inviteUser);
  }

  /**
   * Extend token expiration
   * Send invitation email
   */
  private async extendTokenTimeAndResendEmail(entity: InviteUser) {
    const inviteUser = await this.inviteUserRepo.save(
      this.inviteUserRepo.create({
        ...entity,
        expiresAt: moment().add(24, 'hours').toDate(),
      }),
    );

    this.dispatchUserInvitedEvent(inviteUser);

    return inviteUser;
  }

  /**
   * Fire user invited event
   */
  private dispatchUserInvitedEvent(entity: InviteUser) {
    this.eventEmitter.emitAsync('user.invited', new UserInvitedEvent(entity));
  }

  private reload(entity: InviteUser) {
    return this.inviteUserRepo.findOne(entity.id);
  }

  constructor(
    @InjectRepository(InviteUser)
    private inviteUserRepo: Repository<InviteUser>,
    @Inject(forwardRef(() => OrganizationMembersService))
    private organizationMembersService: OrganizationMembersService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private eventEmitter: EventEmitter2,
  ) {}
}
