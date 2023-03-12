import { z } from 'zod';

import { PaginatedList } from '@shared/paginated-list';
import { UserId } from '@features/users';

import { type CheckInsRepository } from './repositories';
import { CheckInId } from './check-in.identifier';
import { type CheckIn } from './check-in.entity';

export const listUserCheckInHistoryPayload = z.object({
  userId: UserId,
  cursor: CheckInId.nullish(),
});

type ListUserCheckInHistoryPayload = z.infer<
  typeof listUserCheckInHistoryPayload
>;

export class ListUserCheckInHistoryService {
  constructor(private readonly checkInsRepository: CheckInsRepository) {}

  async execute({
    userId,
    cursor,
  }: ListUserCheckInHistoryPayload): Promise<PaginatedList<CheckIn>> {
    const checkins = await this.checkInsRepository.findManyByUserId({
      userId,
      cursor: cursor ?? undefined,
    });

    return new PaginatedList(checkins);
  }
}
