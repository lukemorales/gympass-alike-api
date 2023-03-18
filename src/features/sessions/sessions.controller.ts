import { type FastifyReply, type FastifyRequest } from 'fastify';

import { exhaustive } from 'exhaustive';

import { E, pipe } from '@shared/effect';

import {
  createSessionPayload,
  type CreateSessionService,
} from './create-session.service';
import { makeCreateSessionService } from './factories';

export class SessionsController {
  private readonly createSessionService: CreateSessionService;

  constructor() {
    this.createSessionService = makeCreateSessionService();
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = pipe(request.body, createSessionPayload.parse);

    const result = await this.createSessionService.execute(payload);

    if (E.isLeft(result)) {
      return exhaustive.tag(result.left, 'tag', {
        InvalidCredentials: (_) =>
          reply.status(400).send({ message: 'Invalid credentials' }),
      });
    }

    const { user } = result.right;

    const token = await reply.jwtSign({}, { sign: { sub: user.id } });

    return reply.status(200).send({ token });
  }
}
