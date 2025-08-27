import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { Role } from '../../user/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { validateToken } from 'src/utils/jwt';

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

    const { cookies } = context.switchToHttp().getRequest<Request>();

    if (!cookies?.jwt) {
      return false;
    }

    const currentUser = validateToken(cookies.jwt, this.config);
    //console.log(currentUser);

    // validate token
    //console.log(requiredRoles);

    return requiredRoles.includes((currentUser as Partial<User>)?.role as Role);
  }
}
