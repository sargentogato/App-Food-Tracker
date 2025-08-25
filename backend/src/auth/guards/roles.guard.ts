import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import { Role } from '../../user/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { headers, cookies } = context.switchToHttp().getRequest<Request>();
    const authHeader = headers.authorization;

    console.log(cookies?.jwt);

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return false;
    }

    const token = authHeader.split(' ')[1];

    const currentUser = this.validateToken(token);
    //console.log(currentUser);

    // validate token
    //console.log(requiredRoles);

    return requiredRoles.includes((currentUser as Partial<User>)?.role as Role);
  }

  validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.config.get<string>('SECRET_KEY')!);
      return decoded; // Assuming the decoded token contains user information
    } catch (error) {
      console.error('Token validation error:', error);
      return null; // Return null if token is invalid or expired
    }
  }
}
