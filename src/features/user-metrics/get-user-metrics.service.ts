import { z } from 'zod';

import { UserId } from '@features/users';
import { type CheckInsRepository } from '@features/check-ins';
import { type Clock } from '@features/clock';

import { type UserMetric } from './user-metric.entity';
import { UserMetricAdapter } from './user-metric.adapter';

export const getUserMetricsPayload = z.object({
  userId: UserId,
});

type GetUserMetricsPayload = z.infer<typeof getUserMetricsPayload>;

export class GetUserMetricsService {
  constructor(
    private readonly checkInsRepository: CheckInsRepository,
    private readonly clock: Clock,
  ) {}

  async execute({ userId }: GetUserMetricsPayload): Promise<UserMetric> {
    const checkInCount = await this.checkInsRepository.countByUserId(userId);

    return UserMetricAdapter.toDomain({
      userId,
      checkInCount,
      updatedAt: this.clock.now,
    });
  }
}
