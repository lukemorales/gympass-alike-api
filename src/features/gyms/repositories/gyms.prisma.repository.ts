import { type PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

import { prisma } from '@shared/prisma';
import { O, pipe } from '@shared/effect';
import { unprefixId } from '@shared/unprefix-id';

import { type CreateGymOptions, type GymsRepository } from './gyms.repository';
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
}
