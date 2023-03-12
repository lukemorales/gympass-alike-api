import { z } from 'zod';

import { E, O } from '@shared/effect';
import { Email, HashedPassword, Password } from '@shared/branded-types';

import { type UsersRepository } from './repositories';
import { type User } from './user.entity';

export const createUserPayload = z.object({
  name: z.string().min(1),
  email: Email,
  password: Password,
});

type CreateUserPayload = z.infer<typeof createUserPayload>;

export type CreateUserError = EmailNotAvailable;

class EmailNotAvailable {
  readonly tag = 'EmailNotAvailable';

  constructor(readonly email: string) {}
}

class UserCreated {
  readonly tag = 'UserCreated';

  constructor(readonly user: User) {}
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

    const user = await this.usersRepository.create({
      name,
      email,
      passwordHash: await HashedPassword.parseAsync(password),
    });

    return E.right(new UserCreated(user));
  }
}
