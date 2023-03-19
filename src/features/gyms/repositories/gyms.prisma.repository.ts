import { Prisma, type Gym, type PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

import { prisma } from '@shared/prisma';
import { A, O, pipe } from '@shared/effect';
import { unprefixId } from '@shared/unprefix-id';
import { MAX_PAGE_SIZE } from '@shared/paginated-list';
import { MAX_GYM_SEARCH_RADIUS_IN_KILOMETERS } from '@shared/get-distance-between-coordinates';

import {
  type SearchGymsOptions,
  type CreateGymOptions,
  type GymsRepository,
  type FindManyByCoordsOptions,
} from './gyms.repository';
import { GymAdapter } from '../gym.adapter';
import { type GymId } from '../gym.identifier';

export class GymsPrismaRepository implements GymsRepository {
  private readonly repository: PrismaClient['gym'];

  constructor() {
    this.repository = prisma.gym;
  }

  async create(options: CreateGymOptions) {
    const gym = await this.repository.create({
      data: {
        ...options,
        id: ulid(),
      },
    });

    return pipe(gym, GymAdapter.toDomain);
  }

  async findById(id: GymId) {
    const gym = await this.repository.findUnique({
      where: { id: unprefixId(id) },
    });

    return pipe(gym, O.fromNullable, O.map(GymAdapter.toDomain));
  }

  async searchMany({ query, cursor }: SearchGymsOptions) {
    const gyms = await this.repository.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      cursor: cursor ? { id: unprefixId(cursor) } : undefined,
      orderBy: { id: 'asc' },
      skip: cursor ? 1 : undefined,
      take: MAX_PAGE_SIZE,
    });

    return pipe(gyms, A.map(GymAdapter.toDomain));
  }

  async findManyByCoords({ coords, cursor }: FindManyByCoordsOptions) {
    const gyms = await prisma.$queryRaw<Gym[]>(Prisma.sql`
    SELECT * from gyms
    WHERE ( 6371 * acos( cos( radians(${
      coords.lat
    }) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${
      coords.long
    }) ) + sin( radians(${
      coords.lat
    }) ) * sin( radians( latitude ) ) ) ) <= ${MAX_GYM_SEARCH_RADIUS_IN_KILOMETERS}
    ${cursor ? `AND WHERE id > ${unprefixId(cursor)}` : ''}
    ORDER BY id ASC
    LIMIT ${MAX_PAGE_SIZE}
  `);

    return pipe(gyms, A.map(GymAdapter.toDomain));
  }
}
