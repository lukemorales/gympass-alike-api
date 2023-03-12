import { ulid } from 'ulid';
import { Prisma, type PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

import { prisma } from '@shared/prisma';
import { A, E, flow, O, pipe } from '@shared/effect';
import { MAX_PAGE_SIZE } from '@shared/paginated-list';
import { unprefixId } from '@shared/unprefix-id';
import { type UserId } from '@features/users';
import { ResourceNotFound } from '@shared/failures';

import {
  type CreateCheckInOptions,
  type CheckInsRepository,
  type FindByMembershipAndDateOptions,
  type FindManyByUserIdOptions,
  type UpdateCheckInOptions,
} from './check-ins.repository';
import { CheckInAdapter } from '../check-in.adapter';
import { type CheckInId } from '../check-in.identifier';
import { type CheckIn } from '../check-in.entity';

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

  async update(
    id: CheckInId,
    options: UpdateCheckInOptions,
  ): Promise<E.Either<ResourceNotFound, CheckIn>> {
    return this.repository
      .update({
        where: { id: unprefixId(id) },
        data: {
          validated_at: pipe(options.validatedAt, O.getOrUndefined),
        },
      })
      .then(flow(CheckInAdapter.toDomain, E.right))
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            return E.left(new ResourceNotFound(id));
          }
        }

        throw error;
      });
  }

  async findById(id: CheckInId) {
    const user = await this.repository.findUnique({
      where: { id: unprefixId(id) },
    });

    return pipe(user, O.fromNullable, O.map(CheckInAdapter.toDomain));
  }

  async findByMembershipAndDate({
    userId,
    gymId,
    date,
  }: FindByMembershipAndDateOptions) {
    const targetDate = dayjs(date);
    const startOfDay = targetDate.startOf('date');
    const endOfDay = targetDate.endOf('date');

    const checkIn = await this.repository.findFirst({
      where: {
        user_id: unprefixId(userId),
        gym_id: unprefixId(gymId),
        created_at: {
          gte: startOfDay.toDate(),
          lte: endOfDay.toDate(),
        },
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

  async countByUserId(userId: UserId) {
    const count = await this.repository.count({
      where: { user_id: unprefixId(userId) },
    });

    return count;
  }
}
