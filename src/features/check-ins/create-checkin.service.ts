import { z } from 'zod';
import { type CheckIn } from '@prisma/client';

import { E, O } from '@shared/effect';
import { type Clock } from '@features/clock';

import { type CheckInsRepository } from './repositories';

export const createCheckInPayload = z.object({
  userId: z.string().min(1),
  gymId: z.string().min(1),
});

type CreateCheckInPayload = z.infer<typeof createCheckInPayload>;

type CheckInCreationError = DuplicatedCheckInNotAllowed;

class DuplicatedCheckInNotAllowed {
  readonly tag = 'DuplicatedCheckInNotAllowed';

  constructor(readonly date: Date, readonly gymId: string) {}
}

class CheckInCreated {
  readonly tag = 'CheckInCreated';

  constructor(readonly checkIn: CheckIn) {}
}

export class CreateCheckInService {
  constructor(
    private readonly clock: Clock,
    private readonly checkInsRepository: CheckInsRepository,
  ) {}

  async execute({
    userId,
    gymId,
  }: CreateCheckInPayload): Promise<
    E.Either<CheckInCreationError, CheckInCreated>
  > {
    const date = this.clock.now;

    const maybeCheckIn = await this.checkInsRepository.findByMembershipAndDate({
      userId,
      gymId,
      date,
    });

    if (O.isSome(maybeCheckIn)) {
      return E.left(new DuplicatedCheckInNotAllowed(date, gymId));
    }

    const checkIn = await this.checkInsRepository.create({ userId, gymId });

    return E.right(new CheckInCreated(checkIn));
  }
}
