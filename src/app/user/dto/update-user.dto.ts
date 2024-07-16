import { z } from 'zod';
import { CreateUserDto } from './create-user.dto';

export const UpdateUserDto = CreateUserDto.omit({
  username: true,
  password: true,
}).partial();

export type TUpdateUserDto = z.infer<typeof UpdateUserDto>;
