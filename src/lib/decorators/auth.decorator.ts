import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

export function Auth(role?: Role | undefined) {
  return applyDecorators(
    SetMetadata('ROLES', role),
    UseGuards(AuthGuard, RoleGuard),
  );
}
