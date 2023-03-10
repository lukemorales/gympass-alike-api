import { type PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

import { prisma } from '@shared/prisma';
import { O, pipe } from '@shared/effect';

import { type CreateGymOptions, type GymsRepository } from './gyms.repository';

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

    return gym;
  }

  async findById(id: string) {
    const gym = await this.repository.findUnique({
      where: { id },
    });

    return pipe(gym, O.fromNullable);
  }
}
