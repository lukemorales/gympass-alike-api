import { z } from 'zod';

import { GymId } from '@features/gyms';
import { UserId } from '@features/users';

import { CheckInId } from './check-in.identifier';

const CheckInEntity = z.object({
  id: CheckInId,
  gymId: GymId,
  userId: UserId,
  validatedAt: z.date().nullable(),
  createdAt: z.date(),
});

export interface CheckInInput extends z.input<typeof CheckInEntity> {}

export interface CheckInEntity extends z.infer<typeof CheckInEntity> {}

export class CheckIn implements CheckInEntity {
  id: CheckInId;

  gymId: GymId;

  userId: UserId;

  validatedAt: Date | null;

  createdAt: Date;

  constructor(input: CheckInInput) {
    Object.assign(this, CheckInEntity.parse(input));
  }
}
