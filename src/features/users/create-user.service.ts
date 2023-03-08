import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { E, O } from '@shared/effect';

import { UsersPrismaRepository } from './repositories/users.prisma.repository';

export const createUserPayload = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

type CreateUserPayload = z.infer<typeof createUserPayload>;

export type CreateUserError = EmailNotAvailable;

class EmailNotAvailable {
  tag: 'EmailNotAvailable';

  constructor(readonly email: string) {}
}

class UserCreated {
  tag: 'UserCreated';
}

export async function createUserService({
  name,
  email,
  password,
}: CreateUserPayload): Promise<E.Either<CreateUserError, UserCreated>> {
  const usersRepository = new UsersPrismaRepository();

  const existingUser = await usersRepository.findByEmail(email);

  if (O.isSome(existingUser)) {
    return E.left(new EmailNotAvailable(email));
  }

  await usersRepository.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 6),
  });

  return E.right(new UserCreated());
}
