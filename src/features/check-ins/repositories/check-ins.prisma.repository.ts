import { ulid } from 'ulid';
import { type PrismaClient } from '@prisma/client';

import { prisma } from '@shared/prisma';

import {
  type CreateCheckInOptions,
  type CheckInsRepository,
} from './check-ins.repository';

export class CheckInsPrismaRepository implements CheckInsRepository {
  private readonly repository: PrismaClient['checkIn'];

  constructor() {
    this.repository = prisma.checkIn;
  }

  async create({ userId, gymId }: CreateCheckInOptions) {
    const checkIn = await this.repository.create({
      data: {
        id: ulid(),
        user_id: userId,
        gym_id: gymId,
      },
    });

    return checkIn;
  }
}
