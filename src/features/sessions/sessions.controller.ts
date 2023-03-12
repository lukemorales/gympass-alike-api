import { type FastifyInstance } from 'fastify';

import { exhaustive } from 'exhaustive';

import { E, pipe } from '@shared/effect';
import { UserAdapter } from '@features/users';

import { createSessionPayload } from './create-session.service';
import { makeCreateSessionService } from './factories';

export async function sessionsController(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const payload = pipe(request.body, createSessionPayload.parse);

    const createSessionService = makeCreateSessionService();

    const result = await createSessionService.execute(payload);

    return pipe(
      result,
      E.match(
        (error) =>
          exhaustive.tag(error, 'tag', {
            InvalidCredentials: (_) =>
              reply.status(400).send({ message: 'Invalid credentials' }),
          }),
        (success) =>
          reply
            .status(200)
            .send({ user: pipe(success.user, UserAdapter.toJSON) }),
      ),
    );
  });
}
