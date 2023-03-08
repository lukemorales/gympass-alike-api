import bcrypt from 'bcryptjs';
import { ulid } from 'ulid';
import { z } from 'zod';

import { prisma } from '@shared/prisma';
import { E } from '@shared/effect';

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
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return E.left(new EmailNotAvailable(email));
  }

  await prisma.user.create({
    data: {
      id: ulid(),
      name,
      email,
      password_hash: await bcrypt.hash(password, 6),
    },
  });

  return E.right(new UserCreated());
}
