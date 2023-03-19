import { type FastifyInstance } from 'fastify';

import { SessionsController } from './sessions.controller';

export async function sessionsRoutes(app: FastifyInstance) {
  const sessionsController = new SessionsController();

  app.post('/sessions', sessionsController.create);

  app.patch('/sessions', sessionsController.revalidate);
}
