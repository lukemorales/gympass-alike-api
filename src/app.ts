import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastify from 'fastify';

import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { ENV } from './config/env';
import { appRoutes } from './routes';

export const app = fastify();

void app.register(fastifyJwt, {
  secret: ENV.JWT_SECRET,
  cookie: {
    cookieName: 'refresh-token',
    signed: false,
  },
  sign: {
    expiresIn: '10m',
  },
});

void app.register(fastifyCookie);

void app.register(appRoutes, { prefix: '/v1' });

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    const hasInvalidUlidError = error.issues.some(
      (issue) => issue.code === 'custom' && error.message.includes('ULID'),
    );

    const hasInvalidEntityIdError = error.issues.some(
      (issue) =>
        issue.code === 'invalid_string' &&
        error.message.includes('Invalid entity id'),
    );

    if (hasInvalidUlidError || hasInvalidEntityIdError) {
      return reply.status(404).send({ message: 'Resource not found' });
    }

    return reply.status(400).send(fromZodError(error));
  }

  if (ENV.NODE_ENV !== 'production') {
    console.error(error);
  } else {
    // TODO: log to monitoring service
  }

  return reply.status(500).send({ message: 'Internal server error 🚨' });
});
