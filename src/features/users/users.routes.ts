import { type FastifyInstance } from 'fastify';

import { sessionsMiddleware } from '@shared/middlewares';

import { UsersController } from './users.controller';

export async function usersRoutes(app: FastifyInstance) {
  const usersController = new UsersController();

  app.post('/users', usersController.create);

  // Authenticated routes
  app.addHook('onRequest', sessionsMiddleware);

  app.get('/me', usersController.getMe);
}
