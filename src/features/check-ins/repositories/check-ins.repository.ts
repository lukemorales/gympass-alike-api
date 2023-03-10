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
export type FindManyByUserIdOptions = {
  userId: string;
  cursor?: string;
};

export interface CheckInsRepository {
  create: (options: CreateCheckInOptions) => Promise<CheckIn>;
  findByMembershipAndDate: (
    options: FindByMembershipAndDateOptions,
  ) => Promise<O.Option<CheckIn>>;
  findManyByUserId: (options: FindManyByUserIdOptions) => Promise<CheckIn[]>;
}
