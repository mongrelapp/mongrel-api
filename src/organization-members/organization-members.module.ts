import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { OrganizationMember } from './organization-member.entity';
import { OrganizationMembersService } from './organization-members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationMember]),
    forwardRef(() => UsersModule),
  ],
  providers: [OrganizationMembersService],
  exports: [OrganizationMembersService],
})
export class OrganizationMembersModule {}
