import { type CheckIn } from '@prisma/client';

import { type O } from '@shared/effect';

export type CreateCheckInOptions = {
  userId: string;
  gymId: string;
};

export type FindByMembershipAndDateOptions = {
  userId: string;
  gymId: string;
  date: Date;
};

export interface CheckInsRepository {
  create: (payload: CreateCheckInOptions) => Promise<CheckIn>;
  findByMembershipAndDate: (
    payload: FindByMembershipAndDateOptions,
  ) => Promise<O.Option<CheckIn>>;
  findManyByUserId: (userId: string) => Promise<CheckIn[]>;
}
