import { type FastifyReply, type FastifyRequest } from 'fastify';

import { type GetUserMetricsService } from './get-user-metrics.service';
import { makeGetUserMetricsService } from './factories';

export class UserMetricsController {
  private readonly getUserMetricsService: GetUserMetricsService;

  constructor() {
    this.getUserMetricsService = makeGetUserMetricsService();
  }

  async generate(request: FastifyRequest, reply: FastifyReply) {
    const { checkIns, updatedAt, userId } =
      await this.getUserMetricsService.execute({
        userId: request.user.sub,
      });

    return reply.status(200).send({
      userId: userId.toString(),
      checkIns,
      updatedAt,
    });
  }
}
