import { IdDto } from 'src/lib/dtos/id.dto';
import { NameDto } from 'src/app/user/dto/create-user.dto';
import { z } from 'zod';

export const CreatePlayerDto = z
  .object({
    userId: IdDto().optional(),
    user: z
      .object({
        first_name: NameDto('First'),
        last_name: NameDto('Last').optional(),
      })
      .optional(),
    gameId: IdDto({ required_error: 'Game id is required' }),
    team: z.string({ required_error: 'Team name is required' }),
    is_capitan: z
      .boolean({ invalid_type_error: 'Is capitan value must be a boolean' })
      .default(false),
  })
  .superRefine((arg, c) => {
    if (!arg.userId && !arg.user) {
      c.addIssue({
        code: 'custom',
        message: 'Either user id or user info must be provided',
        path: ['user'],
      });
    }
  });
