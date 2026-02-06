import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../modules/user/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { validateToken } from 'src/core/utils/jwt';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
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

    const currentUser = validateToken(cookies.jwt as string, this.config) as Partial<User>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    request['currentUser'] = currentUser;

    return requiredRoles.includes(currentUser?.role as Role);
  }
}
