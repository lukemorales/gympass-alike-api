import { type FastifyInstance } from 'fastify';

import { pipe } from '@effect/data/Function';

import { E } from '@shared/effect';

import { createUserPayload } from './create-user.service';
import { makeCreateUserService, makeGetUserService } from './factories';
import { getUserPayload } from './get-user.service';

export async function usersController(app: FastifyInstance) {
  app.post('/:id', async (request, reply) => {
    const payload = pipe(request.params, getUserPayload.parse);

    const getUserService = makeGetUserService();

    const result = await getUserService.execute(payload);

    return pipe(
      result,
      E.match(
        (error) =>
          reply.status(404).send({
            message: `User (${error.resourceId}) not found`,
          }),
        (user) => reply.status(200).send({ user }),
      ),
    );
  });

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
