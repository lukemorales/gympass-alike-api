import { type FastifyInstance } from 'fastify';

import request from 'supertest';
import { ulid } from 'ulid';
import { type Prisma } from '@prisma/client';

import { pipe } from '@shared/effect';
import { type DatabaseUserRole, UserAdapter } from '@features/users';
import { type Password } from '@shared/branded-types';
import { encryptPassword } from '@shared/encrypt-password';
import { prisma } from '@shared/prisma';

type UserOverrides = Omit<
  Prisma.UserCreateInput,
  'id' | 'password_hash' | 'role'
> & {
  role: DatabaseUserRole;
};

type Overrides = {
  user?: Partial<UserOverrides>;
};

export async function setupUser(
  app: FastifyInstance,
  overrides: Overrides = {},
) {
  const userOverrides = overrides.user;
  const userPassword = '123456' as Password;

  const user = await prisma.user.upsert({
    create: {
      id: ulid(),
      name: userOverrides?.name ?? 'John Doe',
      email: userOverrides?.email ?? 'john@doe.com',
      password_hash: await encryptPassword(userPassword),
      role: userOverrides?.role ?? 'MEMBER',
    },
    update: {
      name: userOverrides?.name,
      email: userOverrides?.email,
      role: userOverrides?.role,
    },
    where: {
      email: userOverrides?.email ?? 'john@doe.com',
    },
  });

  await request(app.server).post('/v1/users').send({
    name: user.name,
    email: user.email,
    password: userPassword,
  });

  const authResponse = await request(app.server).post('/v1/sessions').send({
    email: user.email,
    password: userPassword,
  });

  const { token } = authResponse.body as { token: string };

  return { user: pipe(user, UserAdapter.toDomain), token };
}
