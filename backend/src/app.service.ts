import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit(): void {
    try {
      const status = this.connection.readyState;
      // Import ConnectionStates from mongoose and compare with ConnectionStates.connected
      console.log(
        status === ConnectionStates.connected
          ? 'Database is connected'
          : 'Database is not connected',
      );
    } catch (error) {
      console.log('Database connection error');
    }
  }
}
