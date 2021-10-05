import { classToPlain, Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { Organization } from 'src/organizations/organization.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrganizationMemberRoleEnum {
  OWNER = 'Owner',
  USER = 'User',
}

@Entity()
@Index(['user', 'organization'], { unique: true })
export class OrganizationMember {
  @PrimaryGeneratedColumn('uuid')
  @Expose({ name: 'organizationMemberId' })
  id: string;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @Column({
    type: 'enum',
    enum: OrganizationMemberRoleEnum,
    default: OrganizationMemberRoleEnum.USER,
  })
  role: OrganizationMemberRoleEnum;

  @CreateDateColumn()
  @Transform(({ value }) => moment(value).unix())
  createdAt: number;

  @UpdateDateColumn()
  @Transform(({ value }) => moment(value).unix())
  updatedAt: number;

  toJSON() {
    return classToPlain(this);
  }
}
