import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  quantity: number;

  @Prop({ required: true })
  expireDate: Date;

  // Assuming category and provider are strings, adjust types as necessary
  @Prop()
  category: string;

  @Prop()
  provider: string;

  @Prop()
  batchNumber: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
