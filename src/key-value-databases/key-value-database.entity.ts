import { classToPlain, Exclude, Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { Organization } from 'src/organizations/organization.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class KeyValueDatabase {
  @Expose({ name: 'keyValueDatabaseId' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  organization: Organization;

  @Column({ type: 'int', default: 0 })
  lastSuffix: number;

  @Column()
  tableName: string;

  @Column({ type: 'int', default: 0 })
  size: number;

  @Column({ type: 'int', default: 0 })
  readCount: number;

  @Column({ type: 'int', default: 0 })
  writeCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Transform(({ value }) => moment(value).unix(), { toPlainOnly: true })
  @CreateDateColumn()
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  @UpdateDateColumn()
  updatedAt: Date;

  isTableOwner(organizationId: string): boolean {
    return this.organization.id === organizationId;
  }

  toJSON() {
    return classToPlain(this);
  }
}
