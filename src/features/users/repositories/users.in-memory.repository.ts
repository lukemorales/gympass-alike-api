import { ulid } from 'ulid';
import { type User } from '@prisma/client';

import { A, pipe } from '@shared/effect';

import { type UsersRepository } from './users.repository';

type CreateUserOptions = {
  name: string;
  email: string;
  passwordHash: string;
};

export class UsersInMemoryRepository implements UsersRepository {
  readonly repository: User[] = [];

  async create({ name, email, passwordHash }: CreateUserOptions) {
    const user: User = {
      id: ulid(),
      name,
      email,
      password_hash: passwordHash,
      updated_at: new Date(),
      created_at: new Date(),
    };

    this.repository.push(user);

    return user;
  }

  async findByEmail(email: string) {
    return pipe(
      this.repository,
      A.findFirst((user) => user.email === email),
    );
  }
}
