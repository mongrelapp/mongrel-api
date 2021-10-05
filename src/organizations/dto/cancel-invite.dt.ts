import { PickType } from '@nestjs/swagger';
import { InviteUserDto } from './Invite-users.dto';

export class CancelInviteDto extends PickType(InviteUserDto, [
  'email',
] as const) {}
