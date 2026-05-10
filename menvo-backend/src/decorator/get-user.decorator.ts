import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtUser } from '../auth/types/jwt-user.type';

export const GetUser = createParamDecorator(
  <T extends keyof JwtUser>(
    data: T,
    ctx: ExecutionContext,
  ): T extends keyof JwtUser ? JwtUser[T] : JwtUser => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as JwtUser;

    return (data ? user[data] : user) as any;
  },
);
