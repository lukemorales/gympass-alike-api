import bcrypt from 'bcryptjs';
import { ENCRYPTION_SALT_ROUNDS } from '@config/encryption';

import { type Password, type HashedPassword } from './branded-types';

export async function encryptPassword(
  password: Password,
): Promise<HashedPassword> {
  const encrypted = await bcrypt.hash(password, ENCRYPTION_SALT_ROUNDS);

  return encrypted as HashedPassword;
}
