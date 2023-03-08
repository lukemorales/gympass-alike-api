import { type FastifyInstance } from 'fastify';

import { pipe } from '@effect/data/Function';

import { E } from '@shared/effect';

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
        (_) => reply.status(400).send({ message: 'Invalid credentials' }),
        ({ user }) => reply.status(200).send({ user }),
      ),
    );
  });
}
