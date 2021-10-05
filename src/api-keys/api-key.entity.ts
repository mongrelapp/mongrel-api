import { classToPlain, Exclude, Expose, Transform } from 'class-transformer';
import { randomBytes } from 'crypto';
import * as moment from 'moment';
import { User } from 'src/users/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ApiKey {
  @Expose({ name: 'apiKeyId' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @Column()
  key: string;

  @Column({ type: 'bool', default: true })
  isActive: boolean;

  @Transform(({ value }) => moment(value).unix())
  @CreateDateColumn()
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateKey(): void {
    this.key = randomBytes(32).toString('hex');
  }

  toJSON() {
    return classToPlain(this);
  }
}
