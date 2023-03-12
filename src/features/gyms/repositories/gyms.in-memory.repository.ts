import { Prisma, type Gym } from '@prisma/client';
import { ulid } from 'ulid';

import { A, O, pipe } from '@shared/effect';
import { unprefixId } from '@shared/unprefix-id';
import { MAX_PAGE_SIZE } from '@shared/paginated-list';
import {
  getDistanceBetweenCoordinates,
  MAX_GYM_SEARCH_RADIUS_IN_KILOMETERS,
} from '@shared/get-distance-between-coordinates';

import {
  type SearchGymsOptions,
  type CreateGymOptions,
  type GymsRepository,
  type FindManyByCoordsOptions,
} from './gyms.repository';
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

  async searchMany({ query, cursor }: SearchGymsOptions) {
    const entries = pipe(
      this.repository,
      A.filter((gym) => gym.name.toLowerCase().includes(query.toLowerCase())),
    );

    if (cursor) {
      const cursorIndex =
        entries.findIndex((gym) => gym.id === unprefixId(cursor)) + 1;

      return pipe(
        entries.slice(cursorIndex, cursorIndex + MAX_PAGE_SIZE),
        A.map(GymAdapter.toDomain),
      );
    }

    return pipe(entries.slice(0, MAX_PAGE_SIZE), A.map(GymAdapter.toDomain));
  }

  async findManyByCoords({ coords, cursor }: FindManyByCoordsOptions) {
    const entries = pipe(
      this.repository,
      A.filter((gym) => {
        const gymCoords = {
          lat: gym.latitude.toNumber(),
          long: gym.longitude.toNumber(),
        };

        const distance = getDistanceBetweenCoordinates(coords, gymCoords);

        return distance <= MAX_GYM_SEARCH_RADIUS_IN_KILOMETERS;
      }),
    );

    if (cursor) {
      const cursorIndex =
        entries.findIndex((gym) => gym.id === unprefixId(cursor)) + 1;

      return pipe(
        entries.slice(cursorIndex, cursorIndex + MAX_PAGE_SIZE),
        A.map(GymAdapter.toDomain),
      );
    }

    return pipe(entries.slice(0, MAX_PAGE_SIZE), A.map(GymAdapter.toDomain));
  }
}
