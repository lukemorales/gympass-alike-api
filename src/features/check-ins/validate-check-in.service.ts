import { z } from 'zod';
import dayjs from 'dayjs';

import { E, O, pipe } from '@shared/effect';
import { type Clock } from '@features/clock';
import { ResourceNotFound } from '@shared/failures';

import { type CheckInsRepository } from './repositories';
import { type CheckIn } from './check-in.entity';
import { CheckInId } from './check-in.identifier';

export const validateCheckInPayload = z.object({
  checkInId: CheckInId,
});

type ValidateCheckInPayload = z.infer<typeof validateCheckInPayload>;

type CheckInValidationError = ResourceNotFound | ExpiredCheckIn;

class ExpiredCheckIn {
  readonly tag = 'ExpiredCheckIn';

  constructor(readonly checkInId: CheckInId) {}
}

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
    const maybeCheckIn = await this.checkInsRepository.findById(checkInId);

    if (O.isNone(maybeCheckIn)) {
      return E.left(new ResourceNotFound(checkInId));
    }

    const checkIn = maybeCheckIn.value;
    const validationDate = this.clock.now;

    const pastTimeSinceCreation = dayjs(validationDate).diff(
      checkIn.createdAt,
      'minutes',
    );

    if (pastTimeSinceCreation > 20) {
      return E.left(new ExpiredCheckIn(checkInId));
    }

    const result = await this.checkInsRepository.update(checkInId, {
      validatedAt: O.some(validationDate),
    });

    return pipe(
      result,
      E.map((updatedCheckIn) => new CheckInValidated(updatedCheckIn)),
    );
  }
}
