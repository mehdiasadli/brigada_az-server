import { z } from 'zod';
import { CreateUserDto } from './create-user.dto';

export const UpdateUserDto = CreateUserDto.omit({
  username: true,
  password: true,
}).merge(
  z.object({
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  }),
);

export type TUpdateUserDto = z.infer<typeof UpdateUserDto>;
