import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from 'src/modules/products/entities/product.entity';
import { Delivery } from './delivery.entity';

@Entity({ name: 'deliveries_products' })
export class DeliveryProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Delivery, (delivery) => delivery.details, { onDelete: 'CASCADE' })
  delivery: Delivery;

  @ManyToOne(() => Product, (product) => product.deliveryDetails)
  product: Product;
}
