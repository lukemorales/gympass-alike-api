import { type FastifyInstance } from 'fastify';

import { sessionsMiddleware } from '@shared/middlewares';

import { GymsController } from './gyms.controller';

export async function gymRoutes(app: FastifyInstance) {
  app.addHook('onRequest', sessionsMiddleware);

  const gymsController = new GymsController();

  app.get('/search', gymsController.search);

  app.get('/nearby', gymsController.getNearby);

  app.post('/', gymsController.create);
}
