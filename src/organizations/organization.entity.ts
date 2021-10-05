import { classToPlain, Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { OrganizationMember } from 'src/organization-members/organization-member.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  @Expose({ name: 'organizationId' })
  id: string;

  @Column()
  name: string;

  @OneToOne(() => User, (user) => user.organization, { eager: true })
  user: User;

  @OneToMany(
    () => OrganizationMember,
    (organizationMembers) => organizationMembers.organization,
  )
  organizationMembers?: OrganizationMember[];

  @CreateDateColumn()
  @Transform(({ value }) => moment(value).unix())
  createdAt: number;

  @UpdateDateColumn()
  @Transform(({ value }) => moment(value).unix())
  updatedAt: number;

  isOwner(userId: string): boolean {
    if (this.user && this.user.id === userId) return true;
    return false;
  }

  toJSON() {
    return classToPlain(this);
  }
}
