import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersControllerV1 } from './controllers/users-v1.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { OrganizationMembersModule } from 'src/organization-members/organization-members.module';
import { StripeModule } from '../stripe/stripe.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => OrganizationsModule),
    forwardRef(() => OrganizationMembersModule),
    StripeModule,
    ConfigModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersControllerV1],
})
export class UsersModule {}
