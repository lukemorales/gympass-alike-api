import { type FastifyInstance } from 'fastify';

import { pipe } from '@effect/data/Function';

import { E } from '@shared/effect';
import { UsersPrismaRepository } from '@features/users';

import {
  createSessionPayload,
  CreateSessionService,
} from './create-session.service';

export async function sessionsController(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const payload = pipe(request.body, createSessionPayload.parse);

    const authenticationService = new CreateSessionService(
      new UsersPrismaRepository(),
    );

    const result = await authenticationService.execute(payload);

    return pipe(
      result,
      E.match(
        (_) => reply.status(409).send({ message: 'Invalid credentials' }),
        ({ user }) => reply.status(200).send({ user }),
      ),
    );
  });
}
