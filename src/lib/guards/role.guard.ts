import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { AppRequest } from 'src/types/express.types';
import { matchRoles } from '../utils/matchRoles';
import { Role } from '@prisma/client';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.get('ROLES', context.getHandler());
    const req = context.switchToHttp().getRequest<AppRequest>();
    const user = await this.prisma.user.findUnique({
      where: {
        id: req.user?.id,
      },
    });

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    return matchRoles(user.roles, role as Role | undefined);
  }
}
