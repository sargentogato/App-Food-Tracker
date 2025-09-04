import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  full_name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ name: 'role', type: 'enum', enum: ['user', 'admin', 'superadmin'], default: 'user' })
  role: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
