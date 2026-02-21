import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  Entity,
} from 'typeorm';
import { DeliveryProduct } from './deliveryProduct.entity';
import { Client } from 'src/modules/clients/entities/client.entity';

@Entity({ name: 'deliveries' })
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  observation: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => Client, (client) => client.deliveries)
  client: Client;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: false })
  createdBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ nullable: false })
  updatedBy: number;

  @OneToMany(() => DeliveryProduct, (deliveryProduct) => deliveryProduct.delivery, {
    cascade: true,
  })
  details: DeliveryProduct[];
}
