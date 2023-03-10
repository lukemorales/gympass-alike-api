import { type CheckIn } from '@prisma/client';
import { z } from 'zod';

import { type CheckInsRepository } from './repositories';

export const listUserCheckInHistoryPayload = z.object({
  userId: z.string().min(1),
});

type ListUserCheckInHistoryPayload = z.infer<
  typeof listUserCheckInHistoryPayload
>;

export class ListUserCheckInHistoryService {
  constructor(private readonly checkInsRepository: CheckInsRepository) {}

  async execute({ userId }: ListUserCheckInHistoryPayload): Promise<CheckIn[]> {
    return this.checkInsRepository.findManyByUserId(userId);
  }
}
