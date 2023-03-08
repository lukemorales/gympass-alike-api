import { type FastifyInstance } from 'fastify';

import { pipe } from '@effect/data/Function';

import { E } from '@shared/effect';

import { createUserPayload, createUserService } from './create-user.service';

export async function usersController(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const payload = pipe(request.body, createUserPayload.parse);

    const result = await createUserService(payload);

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
