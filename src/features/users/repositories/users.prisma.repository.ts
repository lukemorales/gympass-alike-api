import { ulid } from 'ulid';

import { O, pipe } from '@shared/effect';
import { prisma } from '@shared/prisma';

type CreateUserOptions = {
  name: string;
  email: string;
  passwordHash: string;
};

export class UsersPrismaRepository {
  private readonly repository: (typeof prisma)['user'];

  constructor() {
    this.repository = prisma.user;
  }

  async findByEmail(email: string) {
    const user = await this.repository.findUnique({
      where: { email },
    });

    return pipe(user, O.fromNullable);
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
}
