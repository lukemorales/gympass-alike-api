import { type FastifyInstance } from 'fastify';

import { sessionsMiddleware } from '@shared/middlewares';

import { UsersController } from './users.controller';

export async function usersRoutes(app: FastifyInstance) {
  const usersController = new UsersController();

  app.get('/me', { onRequest: [sessionsMiddleware] }, usersController.getMe);

  app.post('/', usersController.create);
}
