import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

export const AuthRole = Reflector.createDecorator<Role>();
