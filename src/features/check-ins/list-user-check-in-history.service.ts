import { type CheckIn } from '@prisma/client';
import { z } from 'zod';

import { PaginatedList } from '@shared/paginated-list';

import { type CheckInsRepository } from './repositories';

export const listUserCheckInHistoryPayload = z.object({
  userId: z.string().min(1),
  cursor: z.string().nullish(),
});

type ListUserCheckInHistoryPayload = z.input<
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
