import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteUser } from './invite-user.entity';
import { InviteUsersService } from './invite-users.service';
import { UserInvitedListener } from './listeners/user.invited.listener';
import { InviteUsersControllerV1 } from './controllers/invite-users-v1.controller';
import { OrganizationMembersModule } from 'src/organization-members/organization-members.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteUser]),
    forwardRef(() => UsersModule),
    forwardRef(() => OrganizationMembersModule),
  ],
  providers: [InviteUsersService, UserInvitedListener],
  exports: [InviteUsersService],
  controllers: [InviteUsersControllerV1],
})
export class InviteUsersModule {}
