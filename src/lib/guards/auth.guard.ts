import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppRequest } from 'src/types/express.types';
import { authenticated } from '../utils/authenticated';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AppRequest>();
    return await authenticated(req);
  }
}
