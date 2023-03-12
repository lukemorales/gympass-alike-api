import { type HashedPassword, type Email } from '@shared/branded-types';
import { type O } from '@shared/effect';

import { type User } from '../user.entity';
import { type UserId } from '../user.identifier';

export type CreateUserOptions = {
  name: string;
  email: Email;
  passwordHash: HashedPassword;
};

export interface UsersRepository {
  create: (options: CreateUserOptions) => Promise<User>;
  findById: (id: UserId) => Promise<O.Option<User>>;
  findByEmail: (email: Email) => Promise<O.Option<User>>;
}
