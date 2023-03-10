import { Prisma, type Gym } from '@prisma/client';
import { ulid } from 'ulid';

import { A, pipe } from '@shared/effect';

import { type CreateGymOptions, type GymsRepository } from './gyms.repository';

export class GymsInMemoryRepository implements GymsRepository {
  readonly repository: Gym[] = [];

  async create(payload: CreateGymOptions) {
    const gym: Gym = {
      ...payload,
      id: ulid(),
      latitude: new Prisma.Decimal(payload.latitude),
      longitude: new Prisma.Decimal(payload.longitude),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.repository.push(gym);

    return gym;
  }

  async findById(id: string) {
    return pipe(
      this.repository,
      A.findFirst((gym) => gym.id === id),
    );
  }
}
