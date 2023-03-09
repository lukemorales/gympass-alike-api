import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { type User } from '@prisma/client';

import { E, O } from '@shared/effect';
import { type UsersRepository } from '@features/users';

export const createSessionPayload = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateSessionPayload = z.infer<typeof createSessionPayload>;

export type CreateSessionError = InvalidCredentials;

class InvalidCredentials {
  readonly tag = 'InvalidCredentials';
}

class AuthenticatedUser {
  readonly tag = 'AuthenticatedUser';

  constructor(readonly user: User) {}
}

export class CreateSessionService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: CreateSessionPayload): Promise<
    E.Either<CreateSessionError, AuthenticatedUser>
  > {
    const maybeUser = await this.usersRepository.findByEmail(email);

    if (O.isNone(maybeUser)) {
      return E.left(new InvalidCredentials());
    }

    const user = maybeUser.value;

    const isMatchingPassword = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!isMatchingPassword) {
      return E.left(new InvalidCredentials());
    }

    return E.right(new AuthenticatedUser(user));
  }
}
