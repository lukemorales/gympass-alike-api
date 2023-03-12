import { z } from 'zod';

import { UserId } from '@features/users';

const UserMetricEntity = z.object({
  userId: UserId,
  checkIns: z.object({
    total: z.number().nonnegative().finite(),
  }),
  updatedAt: z.date(),
});

export interface UserMetricInput extends z.input<typeof UserMetricEntity> {}

export interface UserMetricEntity extends z.infer<typeof UserMetricEntity> {}

export class UserMetric implements UserMetricEntity {
  userId: UserId;

  checkIns: UserMetricEntity['checkIns'];

  updatedAt: Date;

  constructor(input: UserMetricInput) {
    Object.assign(this, UserMetricEntity.parse(input));
  }
}
