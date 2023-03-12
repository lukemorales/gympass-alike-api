import { z } from 'zod';

import { PaginatedList } from '@shared/paginated-list';

import { type Gym } from './gym.entity';
import { type GymsRepository } from './repositories';
import { Coords } from './coords.schema';
import { GymId } from './gym.identifier';

export const getNearbyGymsPayload = z.object({
  coords: Coords,
  cursor: GymId.nullish(),
});

type GetNearbyGymsPayload = z.infer<typeof getNearbyGymsPayload>;

export class GetNearbyGymsService {
  constructor(private readonly gymRepository: GymsRepository) {}

  async execute(payload: GetNearbyGymsPayload): Promise<PaginatedList<Gym>> {
    const { coords, cursor } = payload;

    const gyms = await this.gymRepository.findManyByCoords({
      coords,
      cursor: cursor ?? undefined,
    });

    return new PaginatedList(gyms);
  }
}
