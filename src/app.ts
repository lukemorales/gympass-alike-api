import fastify from 'fastify';

import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { ENV } from '@shared/env';

import { routes } from './routes';

export const app = fastify();

routes.forEach(
  ([controller, prefix]) => void app.register(controller, { prefix }),
);

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send(fromZodError(error));
  }

  if (ENV.NODE_ENV !== 'production') {
    console.error(error);
  } else {
    // TODO: log to monitoring service
  }

  return reply.status(500).send({ message: 'Internal server error 🚨' });
});
