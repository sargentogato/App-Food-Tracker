import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export function validateToken(token: string, config: ConfigService) {
  try {
    const decoded = jwt.verify(token, config.get<string>('SECRET_KEY')!);
    return decoded; // Assuming the decoded token contains user information
  } catch (error) {
    console.error('Token validation error:', error);
    return null; // Return null if token is invalid or expired
  }
}
