import { type FastifyInstance } from 'fastify';

import { sessionsMiddleware } from '@shared/middlewares';

import { UserMetricsController } from './user-metrics.controller';

export async function userMetricsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', sessionsMiddleware);

  const userMetricsController = new UserMetricsController();

  app.get('/me/metrics', userMetricsController.generate);
}
