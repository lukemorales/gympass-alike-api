import { ulid } from 'ulid';
import { type CheckIn } from '@prisma/client';
import dayjs from 'dayjs';

import { A, pipe } from '@shared/effect';

import {
  type CreateCheckInOptions,
  type CheckInsRepository,
  type FindByMembershipAndDateOptions,
} from './check-ins.repository';

export class CheckInsInMemoryRepository implements CheckInsRepository {
  readonly repository: CheckIn[] = [];

  async create({ gymId, userId }: CreateCheckInOptions) {
    const checkIn: CheckIn = {
      id: ulid(),
      gym_id: gymId,
      user_id: userId,
      validated_at: null,
      updated_at: new Date(),
      created_at: new Date(),
    };

    this.repository.push(checkIn);

    return checkIn;
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
          checkIn.user_id === userId && checkIn.gym_id === gymId && isSameDate
        );
      }),
    );
  }
}
