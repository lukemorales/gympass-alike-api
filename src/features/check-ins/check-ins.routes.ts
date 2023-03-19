import { type FastifyInstance } from 'fastify';

import { sessionsMiddleware } from '@shared/middlewares';

import { CheckInsController } from './check-ins.controller';

export async function checkInsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', sessionsMiddleware);

  const checkInsController = new CheckInsController();

  app.post('/gyms/:gymId/check-ins', checkInsController.create);

  app.patch('check-ins/:checkInId/validate', checkInsController.validate);
}
