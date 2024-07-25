import { regexes } from 'src/lib/resources/regex';
import { z } from 'zod';

const EmailDto = z
  .string({ required_error: 'Email is required' })
  .email('Invalid Email');

const UsernameDto = z
  .string({ required_error: 'Username is required' })
  .min(4, 'Username must be at least 4 characters long')
  .max(20, 'Username cannot exceed 20 characters')
  .regex(
    regexes.username,
    'Username can only include english letters, digits and "_" symbol',
  );

export const NameDto = (name: string) =>
  z
    .string({
      required_error: name + ' name is required',
    })
    .min(2, name + ' name must be at least 2 characters long');

export const PasswordDto = z.string({
  required_error: 'Password is required',
});

export const DateOfBirthDto = z.coerce.date({
  invalid_type_error: 'Invalid date value',
});

export const CreateUserDto = z.object({
  email: EmailDto,
  username: UsernameDto,
  password: PasswordDto,
  first_name: NameDto('First'),
  last_name: NameDto('Last'),
  date_of_birth: DateOfBirthDto,
});

export type TCreateUserDto = z.infer<typeof CreateUserDto>;
