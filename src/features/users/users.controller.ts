import { type FastifyInstance } from 'fastify';

import { exhaustive } from 'exhaustive';

import { E, pipe } from '@shared/effect';

import { createUserPayload } from './create-user.service';
import { makeCreateUserService, makeGetUserService } from './factories';
import { getUserPayload } from './get-user.service';
import { UserAdapter } from './user.adapter';

export async function usersController(app: FastifyInstance) {
  app.get('/:id', async (request, reply) => {
    const payload = pipe(request.params, getUserPayload.parse);

    const getUserService = makeGetUserService();

    const result = await getUserService.execute(payload);

    return pipe(
      result,
      E.match(
        (error) =>
          exhaustive.tag(error, 'tag', {
            ResourceNotFound: ({ resourceId }) =>
              reply.status(404).send({
                message: `User (${resourceId}) not found`,
              }),
          }),
        (success) =>
          reply.status(200).send({
            user: pipe(success.user, UserAdapter.toJSON),
          }),
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
          exhaustive.tag(error, 'tag', {
            EmailNotAvailable: ({ email }) =>
              reply.status(409).send({
                message: `The email "${email}" is already registered`,
              }),
          }),
        ({ user }) =>
          reply.status(201).send({
            user: pipe(user, UserAdapter.toJSON),
          }),
      ),
    );
  });
}
