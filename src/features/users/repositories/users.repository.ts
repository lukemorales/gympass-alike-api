import { type User } from '@prisma/client';

import { type O } from '@shared/effect';

export type CreateUserOptions = {
  name: string;
  email: string;
  passwordHash: string;
};

export interface UsersRepository {
  create: (payload: CreateUserOptions) => Promise<User>;
  findByEmail: (email: string) => Promise<O.Option<User>>;
}
