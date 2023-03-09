import { z } from 'zod';
import { type User } from '@prisma/client';

import { E, pipe } from '@shared/effect';
import { ResourceNotFound } from '@shared/failures';

import { type UsersRepository } from './repositories/users.repository';

export const getUserPayload = z.object({
  id: z.string().min(1),
});

type GetUserPayload = z.infer<typeof getUserPayload>;

export type GetUserError = ResourceNotFound;

class UserFound {
  readonly tag = 'UserFound';

  constructor(readonly user: User) {}
}

export class GetUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    id,
  }: GetUserPayload): Promise<E.Either<GetUserError, UserFound>> {
    const maybeUser = await this.usersRepository.findById(id);

    return pipe(
      maybeUser,
      E.fromOption(() => new ResourceNotFound(id)),
      E.map((user) => new UserFound(user)),
    );
  }
}
