import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ENCRYPTION_SALT_ROUNDS } from '@config/encryption';

export const Email = z.string().email().brand<'Email'>();

export type Email = z.infer<typeof Email>;

export const Password = z.string().min(6).brand<'Password'>();

export type Password = z.infer<typeof Password>;

export const HashedPassword = z
  .string()
  .transform(async (password) => bcrypt.hash(password, ENCRYPTION_SALT_ROUNDS))
  .brand<'HashedPassword'>();

export type HashedPassword = z.infer<typeof HashedPassword>;
