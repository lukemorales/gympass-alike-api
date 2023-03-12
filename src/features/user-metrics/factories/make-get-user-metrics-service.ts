import { Clock } from '@features/clock';
import { CheckInsPrismaRepository } from '@features/check-ins';

import { GetUserMetricsService } from '../get-user-metrics.service';

export function makeGetUserMetricsService() {
  const clock = new Clock();
  const checkInsRepository = new CheckInsPrismaRepository();

  return new GetUserMetricsService(checkInsRepository, clock);
}
