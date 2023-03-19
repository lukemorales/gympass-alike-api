import { ulid } from 'ulid';
import { type User } from '@prisma/client';

import { A, O, pipe } from '@shared/effect';
import { type Email } from '@shared/branded-types';
import { unprefixId } from '@shared/unprefix-id';

import {
  type CreateUserOptions,
  type UsersRepository,
} from './users.repository';
import { UserAdapter } from '../user.adapter';
import { type UserId } from '../user.identifier';
import { DatabaseUserRole } from '../user.entity';

export class UsersInMemoryRepository implements UsersRepository {
  readonly repository: User[] = [];

  async create({ name, email, passwordHash }: CreateUserOptions) {
    const user: User = {
      id: ulid(),
      name,
      email,
      role: DatabaseUserRole.enum.MEMBER,
      password_hash: passwordHash,
      updated_at: new Date(),
      created_at: new Date(),
    };

    this.repository.push(user);

    return pipe(user, UserAdapter.toDomain);
  }

  async findById(id: UserId) {
    return pipe(
      this.repository,
      A.findFirst((user) => user.id === unprefixId(id)),
      O.map(UserAdapter.toDomain),
    );
  }

  async findByEmail(email: Email) {
    return pipe(
      this.repository,
      A.findFirst((user) => user.email === email),
      O.map(UserAdapter.toDomain),
    );
  }
}
