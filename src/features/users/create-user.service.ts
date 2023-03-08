import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { E, O } from '@shared/effect';

import { type UsersRepository } from './repositories/users.repository';

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
      passwordHash: await bcrypt.hash(password, 6),
    });

    return E.right(new UserCreated());
  }
}
