import { type FastifyReply, type FastifyRequest } from 'fastify';

import autoBind from 'auto-bind';

import { type GetUserMetricsService } from './get-user-metrics.service';
import { makeGetUserMetricsService } from './factories';

export class UserMetricsController {
  readonly #getUserMetricsService: GetUserMetricsService;

  constructor() {
    this.#getUserMetricsService = makeGetUserMetricsService();

    autoBind(this);
  }

  async generate(request: FastifyRequest, reply: FastifyReply) {
    const { checkIns, updatedAt, userId } =
      await this.#getUserMetricsService.execute({
        userId: request.user.sub,
      });

    return reply.status(200).send({
      userId: userId.toString(),
      checkIns,
      updatedAt,
    });
  }
}
