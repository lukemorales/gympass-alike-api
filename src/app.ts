import fastify from 'fastify';

import { routes } from './routes';

export const app = fastify();

routes.forEach(
  ([controller, prefix]) => void app.register(controller, { prefix }),
);
