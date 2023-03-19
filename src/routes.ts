import { type FastifyInstance } from 'fastify';

import { sessionsRoutes } from '@features/sessions';
import { usersRoutes } from '@features/users';
import { gymRoutes } from '@features/gyms';
import { userMetricsRoutes } from '@features/user-metrics';
import { checkInsRoutes } from '@features/check-ins';

export async function appRoutes(app: FastifyInstance) {
  void app.register(gymRoutes);

  void app.register(sessionsRoutes);

  void app.register(usersRoutes);

  void app.register(checkInsRoutes);

  void app.register(userMetricsRoutes);
}
