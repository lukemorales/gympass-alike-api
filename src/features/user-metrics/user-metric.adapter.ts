import { type UserId } from '@features/users';

import { UserMetric } from './user-metric.entity';

type UserMetricsData = {
  userId: UserId;
  checkInCount: number;
  updatedAt: Date;
};

export class UserMetricAdapter {
  static toDomain(data: UserMetricsData) {
    return new UserMetric({
      userId: data.userId,
      updatedAt: data.updatedAt,
      checkIns: {
        total: data.checkInCount,
      },
    });
  }

  static toJSON(domain: UserMetric) {
    return {
      userId: domain.userId.toString(),
      updatedAt: domain.updatedAt,
      checkIns: {
        total: domain.checkIns.total,
      },
    };
  }
}
