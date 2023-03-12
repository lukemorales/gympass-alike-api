import { ulid } from 'ulid';
import { type CheckIn } from '@prisma/client';
import dayjs from 'dayjs';

import { A, E, O, pipe } from '@shared/effect';
import { MAX_PAGE_SIZE } from '@shared/paginated-list';
import { unprefixId } from '@shared/unprefix-id';
import { type UserId } from '@features/users';
import { type Clock } from '@features/clock';
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

export class CheckInsInMemoryRepository implements CheckInsRepository {
  readonly repository: CheckIn[] = [];

  constructor(private readonly clock: Clock) {}

  async create({ gymId, userId }: CreateCheckInOptions) {
    const date = this.clock.now;

    const checkIn: CheckIn = {
      id: ulid(),
      gym_id: unprefixId(gymId),
      user_id: unprefixId(userId),
      validated_at: null,
      updated_at: date,
      created_at: date,
    };

    this.repository.push(checkIn);

    return pipe(checkIn, CheckInAdapter.toDomain);
  }

  async findById(id: CheckInId) {
    return pipe(
      this.repository,
      A.findFirst((checkIn) => checkIn.id === unprefixId(id)),
      O.map(CheckInAdapter.toDomain),
    );
  }

  async update(id: CheckInId, options: UpdateCheckInOptions) {
    return pipe(
      this.repository,
      A.findFirstIndex((checkIn) => checkIn.id === unprefixId(id)),
      E.fromOption(() => new ResourceNotFound(id)),
      E.map((checkInIndex) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const checkIn = { ...this.repository[checkInIndex]! };

        checkIn.validated_at = pipe(
          options.validatedAt,
          O.getOrElse(() => checkIn.validated_at),
        );

        this.repository[checkInIndex] = checkIn;

        return checkIn;
      }),
      E.map(CheckInAdapter.toDomain),
    );
  }

  async findByMembershipAndDate({
    userId,
    gymId,
    date,
  }: FindByMembershipAndDateOptions) {
    const targetDate = dayjs(date);
    const startOfDay = targetDate.startOf('date');
    const endOfDay = targetDate.endOf('date');

    return pipe(
      this.repository,
      A.findFirst((checkIn) => {
        const checkInDate = dayjs(checkIn.created_at);

        const isSameDate =
          checkInDate.isAfter(startOfDay) && checkInDate.isBefore(endOfDay);

        return (
          checkIn.gym_id === unprefixId(gymId) &&
          checkIn.user_id === unprefixId(userId) &&
          isSameDate
        );
      }),
      O.map(CheckInAdapter.toDomain),
    );
  }

  async findManyByUserId({ userId, cursor }: FindManyByUserIdOptions) {
    const entries = pipe(
      this.repository,
      A.filter((checkIn) => checkIn.user_id === unprefixId(userId)),
    );

    if (cursor) {
      const cursorIndex =
        entries.findIndex((checkIn) => checkIn.id === unprefixId(cursor)) + 1;

      return pipe(
        entries.slice(cursorIndex, cursorIndex + MAX_PAGE_SIZE),
        A.map(CheckInAdapter.toDomain),
      );
    }

    return pipe(
      entries.slice(0, MAX_PAGE_SIZE),
      A.map(CheckInAdapter.toDomain),
    );
  }

  async countByUserId(userId: UserId) {
    return pipe(
      this.repository,
      A.filter((checkIn) => checkIn.user_id === unprefixId(userId)),
      A.length,
    );
  }
}
