import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';

export function validateToken(token: string, config: ConfigService): Partial<User> | null {
  try {
    const decoded = jwt.verify(token, config.get<string>('SECRET_KEY')!);
    return decoded as Partial<User>; // Assuming the decoded token contains user information
  } catch (error) {
    console.error('Token validation error:', error);
    return null; // Return null if token is invalid or expired
  }
}
