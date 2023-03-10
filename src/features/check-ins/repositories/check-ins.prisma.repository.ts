import { ulid } from 'ulid';
import { type PrismaClient } from '@prisma/client';

import { prisma } from '@shared/prisma';
import { O, pipe } from '@shared/effect';

import {
  type CreateCheckInOptions,
  type CheckInsRepository,
  type FindByMembershipAndDateOptions,
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

  async findByMembershipAndDate({
    userId,
    gymId,
    date,
  }: FindByMembershipAndDateOptions) {
    const checkIn = await this.repository.findFirst({
      where: {
        user_id: userId,
        gym_id: gymId,
        created_at: date,
      },
    });

    return pipe(checkIn, O.fromNullable);
  }

  async findManyByUserId(userId: string) {
    return this.repository.findMany({ where: { user_id: userId } });
  }
}
