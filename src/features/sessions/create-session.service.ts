import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { E, O } from '@shared/effect';
import { type User, type UsersRepository } from '@features/users';
import { Email, Password } from '@shared/branded-types';

export const createSessionPayload = z.object({
  email: Email,
  password: Password,
});

export type CreateSessionPayload = z.infer<typeof createSessionPayload>;

export type CreateSessionError = InvalidCredentials;

class InvalidCredentials {
  readonly tag = 'InvalidCredentials';
}

class SessionCreated {
  readonly tag = 'SessionCreated';

  constructor(readonly user: User) {}
}

export class CreateSessionService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: CreateSessionPayload): Promise<
    E.Either<CreateSessionError, SessionCreated>
  > {
    const maybeUser = await this.usersRepository.findByEmail(email);

    if (O.isNone(maybeUser)) {
      return E.left(new InvalidCredentials());
    }

    const user = maybeUser.value;

    const isMatchingPassword = await bcrypt.compare(
      password,
      user._passwordHash,
    );

    if (!isMatchingPassword) {
      return E.left(new InvalidCredentials());
    }

    return E.right(new SessionCreated(user));
  }
}
