import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { exhaustive } from 'exhaustive';

import { E, O } from '@shared/effect';
import { ENV } from '@shared/env';

import { type UsersRepository } from './repositories/users.repository';

const SALT_ROUNDS = exhaustive(ENV.NODE_ENV, {
  test: () => 1,
  development: () => 6,
  production: () => 10,
});

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

export class CreateUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: CreateUserPayload): Promise<E.Either<CreateUserError, UserCreated>> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (O.isSome(existingUser)) {
      return E.left(new EmailNotAvailable(email));
    }

    await this.usersRepository.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    });

    return E.right(new UserCreated());
  }
}
