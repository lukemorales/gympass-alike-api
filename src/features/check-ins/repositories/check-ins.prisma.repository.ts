import { ulid } from 'ulid';
import { type PrismaClient } from '@prisma/client';

import { prisma } from '@shared/prisma';
import { A, O, pipe } from '@shared/effect';
import { MAX_PAGE_SIZE } from '@shared/paginated-list';
import { unprefixId } from '@shared/unprefix-id';

import {
  type CreateCheckInOptions,
  type CheckInsRepository,
  type FindByMembershipAndDateOptions,
  type FindManyByUserIdOptions,
} from './check-ins.repository';
import { CheckInAdapter } from '../check-in.adapter';

export class CheckInsPrismaRepository implements CheckInsRepository {
  private readonly repository: PrismaClient['checkIn'];

  constructor() {
    this.repository = prisma.checkIn;
  }

  async create({ userId, gymId }: CreateCheckInOptions) {
    const checkIn = await this.repository.create({
      data: {
        id: ulid(),
        user_id: unprefixId(userId),
        gym_id: unprefixId(gymId),
      },
    });

    return pipe(checkIn, CheckInAdapter.toDomain);
  }

  async findByMembershipAndDate({
    userId,
    gymId,
    date,
  }: FindByMembershipAndDateOptions) {
    const checkIn = await this.repository.findFirst({
      where: {
        user_id: unprefixId(userId),
        gym_id: unprefixId(gymId),
        created_at: date,
      },
    });

    return pipe(checkIn, O.fromNullable, O.map(CheckInAdapter.toDomain));
  }

  async findManyByUserId({ userId, cursor }: FindManyByUserIdOptions) {
    const checkIns = await this.repository.findMany({
      where: { user_id: unprefixId(userId) },
      cursor: { id: cursor ? unprefixId(cursor) : undefined },
      orderBy: { id: 'asc' },
      skip: cursor ? 1 : undefined,
      take: MAX_PAGE_SIZE,
    });

    return pipe(checkIns, A.map(CheckInAdapter.toDomain));
  }
}
