import { type FastifyInstance } from 'fastify';

import { pipe } from '@effect/data/Function';

import { E } from '@shared/effect';

import { createUserPayload } from './create-user.service';
import { makeCreateUserService } from './factories';

export async function usersController(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const payload = pipe(request.body, createUserPayload.parse);

    const createUserService = makeCreateUserService();

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
