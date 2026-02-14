import { PrimaryGeneratedColumn, Column } from 'typeorm';

export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  contactName: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ nullable: false })
  created_by: number;

  @Column({ nullable: false })
  updated_by: number;
}
