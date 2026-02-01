import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ currentUser: Partial<User> }>();
    const user: Partial<User> | undefined = request.currentUser;

    if (data) {
      return user ? user[data] : undefined;
    }
    return user;
  },
);
