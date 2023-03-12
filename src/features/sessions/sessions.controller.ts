import { type FastifyInstance } from 'fastify';

import { exhaustive } from 'exhaustive';

import { E, pipe } from '@shared/effect';

import { createSessionPayload } from './create-session.service';
import { makeCreateSessionService } from './factories';

export async function sessionsController(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const payload = pipe(request.body, createSessionPayload.parse);

    const createSessionService = makeCreateSessionService();

    const result = await createSessionService.execute(payload);

    if (E.isLeft(result)) {
      return exhaustive.tag(result.left, 'tag', {
        InvalidCredentials: (_) =>
          reply.status(400).send({ message: 'Invalid credentials' }),
      });
    }

    const { user } = result.right;

    const token = await reply.jwtSign({}, { sign: { sub: user.id } });

    return reply.status(200).send({ token });
  });
}
