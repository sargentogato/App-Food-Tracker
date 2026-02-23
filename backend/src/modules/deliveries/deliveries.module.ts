import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { Delivery } from './entities/delivery.entity';
import { DeliveryProduct } from './entities/deliveryProduct.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, DeliveryProduct, Product, Client])],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
  exports: [TypeOrmModule],
})
export class DeliveriesModule {}
