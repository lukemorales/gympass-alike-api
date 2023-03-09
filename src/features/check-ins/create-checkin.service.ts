import { z } from 'zod';
import { type CheckIn } from '@prisma/client';

import { type CheckInsRepository } from './repositories';

export const createCheckInPayload = z.object({
  userId: z.string().min(1),
  gymId: z.string().min(1),
});

type CreateCheckInPayload = z.infer<typeof createCheckInPayload>;

export class CreateCheckInService {
  constructor(private readonly checkInsRepository: CheckInsRepository) {}

  async execute({ userId, gymId }: CreateCheckInPayload): Promise<CheckIn> {
    const checkIn = await this.checkInsRepository.create({ userId, gymId });

    return checkIn;
  }
}
