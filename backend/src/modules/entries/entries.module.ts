import { Module } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { EntriesController } from './entries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryProduct } from './entities/entryProduct.entity';
import { Entry } from './entities/entry.entity';
import { Product } from '../products/entities/product.entity';
import { Provider } from '../providers/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entry, EntryProduct, Product, Provider])],
  controllers: [EntriesController],
  providers: [EntriesService],
  exports: [TypeOrmModule],
})
export class EntriesModule {}
