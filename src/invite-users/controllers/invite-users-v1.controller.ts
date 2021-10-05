import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/user.entity';
import { InviteUsersService } from '../invite-users.service';

@Controller({
  path: 'invite-users',
  version: '1',
})
export class InviteUsersControllerV1 {
  /**
   * Verify Token
   */
  @Get('verify/:token')
  @ApiOperation({ summary: "Verify user's invitation token" })
  @ApiTags('Organization')
  async verifyToken(@Param('token') token: string) {
    await this.inviteUsersService.verifyToken(token);

    return {
      message: "You've been verified successfully",
    };
  }

  /**
   * Get pending invitations
   */
  @Get('pending')
  @ApiTags('Organization')
  @ApiOperation({ summary: 'Get pending invitations' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getPendingInvitations(@AuthUser() authUser: User) {
    const users = await this.inviteUsersService.getPendingInvitations(authUser);
    return { data: users };
  }

  constructor(private inviteUsersService: InviteUsersService) {}
}
