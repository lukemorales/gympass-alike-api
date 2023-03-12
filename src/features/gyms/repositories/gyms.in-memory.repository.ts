import { Prisma, type Gym } from '@prisma/client';
import { ulid } from 'ulid';

import { A, O, pipe } from '@shared/effect';
import { unprefixId } from '@shared/unprefix-id';

import { type CreateGymOptions, type GymsRepository } from './gyms.repository';
import { GymAdapter } from '../gym.adapter';
import { type GymId } from '../gym.identifier';

export class GymsInMemoryRepository implements GymsRepository {
  readonly repository: Gym[] = [];

  async create(options: CreateGymOptions) {
    const gym: Gym = {
      ...options,
      id: ulid(),
      latitude: new Prisma.Decimal(options.latitude),
      longitude: new Prisma.Decimal(options.longitude),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.repository.push(gym);

    return pipe(gym, GymAdapter.toDomain);
  }

  async findById(id: GymId) {
    return pipe(
      this.repository,
      A.findFirst((gym) => gym.id === unprefixId(id)),
      O.map(GymAdapter.toDomain),
    );
  }
}
