import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule], // Assuming userModule is defined and imported correctly
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
