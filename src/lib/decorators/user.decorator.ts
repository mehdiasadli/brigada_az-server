import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { AppRequest } from 'src/types/express.types';

export const UserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<AppRequest>();

    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    return req.user.id;
  },
);
