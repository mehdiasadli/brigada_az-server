import { Role } from '@prisma/client';

export function matchRoles(userRole: Role[], role?: Role): boolean {
  if (!role) {
    return true;
  }

  return userRole.includes(role);
}
