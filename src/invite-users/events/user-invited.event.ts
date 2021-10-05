import { InviteUser } from 'src/invite-users/invite-user.entity';

export class UserInvitedEvent {
  public inviteUser: InviteUser;

  constructor(inviteUser: InviteUser) {
    this.inviteUser = inviteUser;
  }
}
