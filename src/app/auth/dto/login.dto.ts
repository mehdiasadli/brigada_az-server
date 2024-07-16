import { PasswordDto } from 'src/app/user/dto/create-user.dto';
import { z } from 'zod';

const UsernameDto = z.string({ required_error: 'Username is required' });

export const LoginDto = z.object({
  username: UsernameDto,
  password: PasswordDto,
});

export type TLoginDto = z.infer<typeof LoginDto>;
