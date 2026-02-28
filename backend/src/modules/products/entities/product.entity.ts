import { DeliveryProduct } from 'src/modules/deliveries/entities/deliveryProduct.entity';
import { EntryProduct } from 'src/modules/entries/entities/entryProduct.entity';
import { Item } from 'src/modules/items/entities/item.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Item, (item) => item.products, { nullable: false })
  @JoinColumn({ name: 'id_item' })
  item: Item;

  @Column({ nullable: false })
  id_item: number;

  @Column({ default: '' })
  batch_number: string;

  @Column({ nullable: false })
  expire_date: Date;

  @Column()
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ nullable: false })
  created_by: number;

  @Column({ nullable: false })
  updated_by: number;

  @OneToMany(() => EntryProduct, (entryProduct) => entryProduct.product) // CORREGIDO: antes decía entryProduct.entry
  entryDetails: EntryProduct[];

  @OneToMany(() => DeliveryProduct, (deliveryProduct) => deliveryProduct.product) // CORREGIDO: antes decía deliveryProduct.delivery
  deliveryDetails: DeliveryProduct[];
}
