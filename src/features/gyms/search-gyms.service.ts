import { z } from 'zod';

import { PaginatedList } from '@shared/paginated-list';

import { type Gym } from './gym.entity';
import { GymId } from './gym.identifier';
import { type GymsRepository } from './repositories';

export const searchGymsPayload = z.object({
  query: z.string().min(1),
  cursor: GymId.nullish(),
});

type SearchGymsPayload = z.infer<typeof searchGymsPayload>;

export class SearchGymsService {
  constructor(private readonly gymRepository: GymsRepository) {}

  async execute(payload: SearchGymsPayload): Promise<PaginatedList<Gym>> {
    const { query, cursor } = payload;

    const gyms = await this.gymRepository.searchMany({
      query,
      cursor: cursor ?? undefined,
    });

    return new PaginatedList(gyms);
  }
}
