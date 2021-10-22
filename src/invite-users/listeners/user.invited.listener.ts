import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { UserInvitedEvent } from '../events/user-invited.event';

@Injectable()
export class UserInvitedListener {
  @OnEvent('user.invited')
  handleUserInvitedEvent(event: UserInvitedEvent) {
    const invitationLink = this.configService.get<string>(
      'INVITE_USER_ENDPOINT',
    );

    this.mailerService.sendMail({
      to: event.inviteUser.inviteeEmail,
      from: "admin@mongrel.app",
      subject: "You have been invited to collaborate!",
      template: './invite-user',
      context: {
        inviter: event.inviteUser.inviter.fullName,
        organization: event.inviteUser.organization,
        link: `${invitationLink}/${event.inviteUser.token}`,
      },
    });
  }

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}
}
