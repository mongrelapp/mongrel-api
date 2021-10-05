import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteUsersModule } from 'src/invite-users/invite-users.module';
import { OrganizationMembersModule } from 'src/organization-members/organization-members.module';
import { OrganizationsControllerV1 } from './controllers/organizations-v1.controller';
import { Organization } from './organization.entity';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    OrganizationMembersModule,
    InviteUsersModule,
  ],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
  controllers: [OrganizationsControllerV1],
})
export class OrganizationsModule {}
