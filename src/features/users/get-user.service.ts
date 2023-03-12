import { z } from 'zod';

import { E, pipe } from '@shared/effect';
import { ResourceNotFound } from '@shared/failures';

import { type UsersRepository } from './repositories/users.repository';
import { type User } from './user.entity';
import { UserId } from './user.identifier';

export const getUserPayload = z.object({
  id: UserId,
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
