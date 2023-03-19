import { type FastifyReply, type FastifyRequest } from 'fastify';

import { exhaustive } from 'exhaustive';
import autoBind from 'auto-bind';

import { E, pipe } from '@shared/effect';

import {
  createSessionPayload,
  type CreateSessionService,
} from './create-session.service';
import { makeCreateSessionService } from './factories';

export class SessionsController {
  readonly #createSessionService: CreateSessionService;

  constructor() {
    this.#createSessionService = makeCreateSessionService();

    autoBind(this);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = pipe(request.body, createSessionPayload.parse);

    const result = await this.#createSessionService.execute(payload);

    if (E.isLeft(result)) {
      return exhaustive.tag(result.left, 'tag', {
        InvalidCredentials: (_) =>
          reply.status(400).send({ message: 'Invalid credentials' }),
      });
    }

    const { user } = result.right;

    const token = await reply.jwtSign(
      { role: user.role },
      { sign: { sub: user.id } },
    );

    const refreshToken = await reply.jwtSign(
      { role: user.role },
      {
        sign: {
          sub: user.id,
          expiresIn: '7d',
        },
      },
    );

    return reply
      .setCookie('refresh-token', refreshToken, {
        path: '/',
        secure: true,
        sameSite: true,
        httpOnly: true,
      })
      .status(200)
      .send({ token });
  }

  async revalidate(request: FastifyRequest, reply: FastifyReply) {
    await request.jwtVerify({ onlyCookie: true });

    const { sub, role } = request.user;

    const token = await reply.jwtSign({ role }, { sign: { sub } });

    const refreshToken = await reply.jwtSign(
      { role },
      {
        sign: {
          sub,
          expiresIn: '7d',
        },
      },
    );

    return reply
      .setCookie('refresh-token', refreshToken, {
        path: '/',
        secure: true,
        sameSite: true,
        httpOnly: true,
      })
      .status(200)
      .send({ token });
  }
}
