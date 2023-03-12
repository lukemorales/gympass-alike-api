import { z } from 'zod';

import { E, O, pipe } from '@shared/effect';
import { type Clock } from '@features/clock';
import { type ResourceNotFound } from '@shared/failures';

import { type CheckInsRepository } from './repositories';
import { type CheckIn } from './check-in.entity';
import { CheckInId } from './check-in.identifier';

export const validateCheckInPayload = z.object({
  checkInId: CheckInId,
});

type ValidateCheckInPayload = z.infer<typeof validateCheckInPayload>;

type CheckInValidationError = ResourceNotFound;

class CheckInValidated {
  readonly tag = 'CheckInValidated';

  constructor(readonly checkIn: CheckIn) {}
}

export class ValidateCheckInService {
  constructor(
    private readonly checkInsRepository: CheckInsRepository,
    private readonly clock: Clock,
  ) {}

  async execute({
    checkInId,
  }: ValidateCheckInPayload): Promise<
    E.Either<CheckInValidationError, CheckInValidated>
  > {
    const result = await this.checkInsRepository.update(checkInId, {
      validatedAt: O.some(this.clock.now),
    });

    return pipe(
      result,
      E.map((checkIn) => new CheckInValidated(checkIn)),
    );
  }
}
