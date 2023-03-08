import { type FastifyInstance } from 'fastify';

import { pipe } from '@effect/data/Function';

import { E } from '@shared/effect';

import { createUserPayload, CreateUserService } from './create-user.service';
import { UsersPrismaRepository } from './repositories/users.prisma.repository';

export async function usersController(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const payload = pipe(request.body, createUserPayload.parse);

    const createUserService = new CreateUserService(
      new UsersPrismaRepository(),
    );

    const result = await createUserService.execute(payload);

    return pipe(
      result,
      E.match(
        (error) =>
          reply.status(409).send({
            message: `The email "${error.email}" is already registered`,
          }),
        (_) => reply.status(201).send(),
      ),
    );
  });
}
