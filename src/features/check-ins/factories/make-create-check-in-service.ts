import { Clock } from '@features/clock';
import { GymsPrismaRepository } from '@features/gyms';

import { CreateCheckInService } from '../create-check-in.service';
import { CheckInsPrismaRepository } from '../repositories';

export function makeCreateCheckInService() {
  const clock = new Clock();
  const checkInsRepository = new CheckInsPrismaRepository();
  const gymsRepository = new GymsPrismaRepository();

  return new CreateCheckInService(checkInsRepository, clock, gymsRepository);
}
