import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Item } from './modules/items/entities/item.entity';
import { ItemsModule } from './modules/items/items.module';
import { User } from './modules/user/entities/user.entity';
import { UserModule } from './modules/user/user.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ProductsModule } from './modules/products/products.module';
import { EntriesModule } from './modules/entries/entries.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: 3306,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD!,
      database: process.env.MYSQL_DATABASE!,
      entities: [User, Item],
      synchronize: true, //eliminar para produccion
      autoLoadEntities: true,
    }),
    UserModule,
    ItemsModule,
    AuthModule,
    ClientsModule,
    ProvidersModule,
    ProductsModule,
    EntriesModule,
    DeliveriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
