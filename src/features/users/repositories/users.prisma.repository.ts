import { ulid } from 'ulid';
import { type PrismaClient } from '@prisma/client';

import { O, pipe } from '@shared/effect';
import { prisma } from '@shared/prisma';
import { unprefixId } from '@shared/unprefix-id';
import { type Email } from '@shared/branded-types';

import {
  type CreateUserOptions,
  type UsersRepository,
} from './users.repository';
import { UserAdapter } from '../user.adapter';
import { type UserId } from '../user.identifier';

export class UsersPrismaRepository implements UsersRepository {
  private readonly repository: PrismaClient['user'];

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

    return pipe(user, UserAdapter.toDomain);
  }

  async findById(id: UserId) {
    const user = await this.repository.findUnique({
      where: { id: unprefixId(id) },
    });

    return pipe(user, O.fromNullable, O.map(UserAdapter.toDomain));
  }

  async findByEmail(email: Email) {
    const user = await this.repository.findUnique({
      where: { email },
    });

    return pipe(user, O.fromNullable, O.map(UserAdapter.toDomain));
  }
}
