import { z } from 'zod';

import { E, O } from '@shared/effect';
import { type Clock } from '@features/clock';
import { GymId, type GymsRepository } from '@features/gyms';
import { ResourceNotFound } from '@shared/failures';
import { UserId } from '@features/users';
import { Coords } from '@shared/coordinates.schema';

import { type CheckInsRepository } from './repositories';
import {
  getDistanceBetweenCoordinates,
  MAX_DISTANCE_FROM_GYM_IN_KILOMETERS,
} from '../../shared/get-distance-between-coordinates';
import { type CheckIn } from './check-in.entity';

export const createCheckInPayload = z.object({
  gymId: GymId,
  userId: UserId,
  coords: Coords,
});

type CreateCheckInPayload = z.infer<typeof createCheckInPayload>;

type CheckInCreationError =
  | DuplicateCheckInNotAllowed
  | ResourceNotFound
  | NotOnLocation;

class DuplicateCheckInNotAllowed {
  readonly tag = 'DuplicateCheckInNotAllowed';

  constructor(readonly date: Date, readonly gymId: string) {}
}

class NotOnLocation {
  readonly tag = 'NotOnLocation';

  constructor(readonly distance: number) {}
}

class CheckInCreated {
  readonly tag = 'CheckInCreated';

  constructor(readonly checkIn: CheckIn) {}
}

export class CreateCheckInService {
  constructor(
    private readonly checkInsRepository: CheckInsRepository,
    private readonly clock: Clock,
    private readonly gymsRepository: GymsRepository,
  ) {}

  async execute({
    userId,
    gymId,
    coords,
  }: CreateCheckInPayload): Promise<
    E.Either<CheckInCreationError, CheckInCreated>
  > {
    const maybeGym = await this.gymsRepository.findById(gymId);

    if (O.isNone(maybeGym)) {
      return E.left(new ResourceNotFound(gymId));
    }

    const date = this.clock.now;

    const maybeCheckIn = await this.checkInsRepository.findByMembershipAndDate({
      userId,
      gymId,
      date,
    });

    if (O.isSome(maybeCheckIn)) {
      return E.left(new DuplicateCheckInNotAllowed(date, gymId));
    }

    const gym = maybeGym.value;

    const distanceFromGym = getDistanceBetweenCoordinates(coords, gym.coords);

    if (distanceFromGym > MAX_DISTANCE_FROM_GYM_IN_KILOMETERS) {
      return E.left(new NotOnLocation(distanceFromGym));
    }

    const checkIn = await this.checkInsRepository.create({ userId, gymId });

    return E.right(new CheckInCreated(checkIn));
  }
}
