import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from 'src/modules/products/entities/product.entity';
import { Entry } from './entry.entity';

@Entity({ name: 'entries_products' })
export class EntryProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Entry, (entry) => entry.details, { onDelete: 'CASCADE' })
  entry: Entry;

  @ManyToOne(() => Product, (product) => product.entryDetails) // Aquí apunta a entryDetails
  product: Product;
}
