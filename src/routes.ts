import { type FastifyInstance } from 'fastify';

import { sessionsRoutes } from '@features/sessions';
import { usersRoutes } from '@features/users';
import { gymRoutes } from '@features/gyms';
import { userMetricsRoutes } from '@features/user-metrics';

export async function appRoutes(app: FastifyInstance) {
  void app.register(gymRoutes, { prefix: '/gyms' });

  void app.register(sessionsRoutes, { prefix: '/sessions' });

  void app.register(usersRoutes, { prefix: '/users' });

  void app.register(userMetricsRoutes);
}
