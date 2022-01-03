import { classToPlain, Exclude, Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { CollectKeyword } from '../collect-keywords/collect-keyword.entity';

@Entity()
export class CollectEmail {
  @Expose({ name: 'collectEmailId' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @ManyToOne(() => CollectKeyword, (keyword) => keyword.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  keyword: CollectKeyword;

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
