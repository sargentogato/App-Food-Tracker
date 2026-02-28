import { Delivery } from 'src/modules/deliveries/entities/delivery.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  contactName: string;

  @OneToMany(() => Delivery, (delivery) => delivery.client)
  deliveries: Delivery[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ nullable: false })
  created_by: number;

  @Column({ nullable: false })
  updated_by: number;
}
