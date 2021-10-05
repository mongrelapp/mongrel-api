import { IsNotEmpty, IsUUID } from 'class-validator';

export class CancelInvitationDto {
  @IsNotEmpty()
  @IsUUID()
  readonly organizationId!: string;

  @IsNotEmpty()
  @IsUUID()
  readonly invitee!: string;
}
