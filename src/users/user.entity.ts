import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { hash } from 'bcrypt';
import { classToPlain, Exclude, Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { Organization } from 'src/organizations/organization.entity';
import { SocialProviderTypeEnum } from 'src/auth/dto/social-login.dto';

export enum RoleType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum AuthType {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
}

@Entity()
export class User {
  private _jti: string;

  @PrimaryGeneratedColumn('uuid')
  @Expose({ name: 'userId' })
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role: RoleType;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, default: false })
  verified: boolean;

  @Column({ nullable: true, default: true })
  isActive: boolean;

  @OneToOne(() => Organization, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  organization: Organization;

  @Column({ type: 'enum', enum: SocialProviderTypeEnum, nullable: true })
  socialProvider?: SocialProviderTypeEnum;

  @Column({ nullable: true })
  socialProviderId?: string;

  @Column({ nullable: true })
  stripeCustimerId: string;

  @CreateDateColumn()
  @Transform(({ value }) => moment(value).unix())
  createdAt: number;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: number;

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public get jti(): string {
    return this._jti;
  }

  public set jti(v: string) {
    this._jti = v;
  }

  @BeforeInsert()
  async hashPassword(): Promise<string> {
    if (this.password) {
      return (this.password = await hash(this.password, 10));
    }
  }

  toJSON() {
    return classToPlain(this);
  }
}
