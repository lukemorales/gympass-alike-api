import { Clock } from '@features/clock';

import { CheckInsPrismaRepository } from '../repositories';
import { ValidateCheckInService } from '../validate-check-in.service';

export function makeValidateCheckInService() {
  const clock = new Clock();
  const checkInsRepository = new CheckInsPrismaRepository();

  return new ValidateCheckInService(checkInsRepository, clock);
}
