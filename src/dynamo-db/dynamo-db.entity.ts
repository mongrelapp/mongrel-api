import { classToPlain, Exclude, Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { Organization } from 'src/organizations/organization.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index(['organization', 'tableId'], { unique: true })
@Entity()
export class DynamoDb {
  @Expose({ name: 'dynamoDbId' })
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

  @Column()
  tableId: string;

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
