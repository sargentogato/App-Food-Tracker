import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntryProduct } from './entryProduct.entity';
import { Provider } from 'src/modules/providers/entities/provider.entity';

@Entity({ name: 'entries' })
export class Entry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  observation: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => Provider, (provider) => provider.entries)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column({ nullable: false })
  providerId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: false })
  createdBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ nullable: false })
  updatedBy: number;

  @OneToMany(() => EntryProduct, (entryProduct) => entryProduct.entry, {
    cascade: true,
  })
  details: EntryProduct[];
}
