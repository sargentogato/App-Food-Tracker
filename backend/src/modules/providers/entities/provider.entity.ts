import { Entry } from 'src/modules/entries/entities/entry.entity';
import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'providers' })
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  contactName: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  address: string;

  @OneToMany(() => Entry, (entry) => entry.provider)
  entries: Entry[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ nullable: false })
  created_by: number;

  @Column({ nullable: false })
  updated_by: number;
}
