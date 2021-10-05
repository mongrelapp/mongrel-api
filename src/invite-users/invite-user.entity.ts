import { classToPlain, Exclude, Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { Organization } from 'src/organizations/organization.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class InviteUser {
  @Expose({ name: 'inviteUserId' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  inviter: User;

  @Column()
  inviteeEmail: string;

  @Column()
  inviteeFirstName: string;

  @Column()
  inviteeLastName: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  organization: Organization;

  @Column()
  token: string;

  @Transform(({ value }) => moment(value).unix())
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Transform(({ value }) => moment(value).unix())
  @CreateDateColumn()
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return classToPlain(this);
  }
}
