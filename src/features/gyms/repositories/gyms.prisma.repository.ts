import { type PrismaClient } from '@prisma/client';

import { prisma } from '@shared/prisma';
import { O, pipe } from '@shared/effect';

import { type GymsRepository } from './gyms.repository';

export class GymsPrismaRepository implements GymsRepository {
  private readonly repository: PrismaClient['gym'];

  constructor() {
    this.repository = prisma.gym;
  }

  async findById(id: string) {
    const gym = await this.repository.findUnique({
      where: { id },
    });

    return pipe(gym, O.fromNullable);
  }
}
