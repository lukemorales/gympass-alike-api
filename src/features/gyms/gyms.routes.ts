import { type FastifyInstance } from 'fastify';

import {
  sessionsMiddleware,
  verifyUserRoleMiddleware,
} from '@shared/middlewares';

import { GymsController } from './gyms.controller';

export async function gymRoutes(app: FastifyInstance) {
  app.addHook('onRequest', sessionsMiddleware);

  const gymsController = new GymsController();

  app.post(
    '/gyms',
    { onRequest: [verifyUserRoleMiddleware(['Admin'])] },
    gymsController.create,
  );

  app.get('/gyms/search', gymsController.search);

  app.get('/gyms/nearby', gymsController.getNearby);
}
