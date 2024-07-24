import { z } from 'zod';
import { CreateUserDto } from './create-user.dto';

export const ChangePasswordDto = CreateUserDto.pick({
  password: true,
})
  .merge(
    z.object({
      new_password: z.string().min(1, 'New password is required'),
      confirm_new_password: z.string().min(1, 'Confirm your new password'),
    }),
  )
  .superRefine((arg, c) => {
    if (arg.new_password === arg.password) {
      c.addIssue({
        code: 'custom',
        path: ['new_password'],
        message: 'New password is same with the old one',
      });

      return z.NEVER;
    }

    if (arg.confirm_new_password !== arg.new_password) {
      c.addIssue({
        code: 'custom',
        path: ['confirm_new_password'],
        message: 'New passwords do not match',
      });
    }
  });

export type TChangePasswordDto = z.infer<typeof ChangePasswordDto>;
