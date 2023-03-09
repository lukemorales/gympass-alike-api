import { ulid } from 'ulid';

import { O, pipe } from '@shared/effect';
import { prisma } from '@shared/prisma';

import { type UsersRepository } from './users.repository';

type CreateUserOptions = {
  name: string;
  email: string;
  passwordHash: string;
};

export class UsersPrismaRepository implements UsersRepository {
  private readonly repository: (typeof prisma)['user'];

  constructor() {
    this.repository = prisma.user;
  }

  async create({ name, email, passwordHash }: CreateUserOptions) {
    const user = await this.repository.create({
      data: {
        id: ulid(),
        name,
        email,
        password_hash: passwordHash,
      },
    });

    return user;
  }

  async findById(id: string) {
    const user = await this.repository.findUnique({
      where: { id },
    });

    return pipe(user, O.fromNullable);
  }

  async findByEmail(email: string) {
    const user = await this.repository.findUnique({
      where: { email },
    });

    return pipe(user, O.fromNullable);
  }
}
