import { type GymId } from '@features/gyms';
import { type UserId } from '@features/users';
import { type O } from '@shared/effect';

import { type CheckIn } from '../check-in.entity';
import { type CheckInId } from '../check-in.identifier';

export type CreateCheckInOptions = {
  userId: UserId;
  gymId: GymId;
};

export type FindByMembershipAndDateOptions = {
  userId: UserId;
  gymId: GymId;
  date: Date;
};

export type FindManyByUserIdOptions = {
  userId: UserId;
  cursor?: CheckInId;
};

export interface CheckInsRepository {
  create: (options: CreateCheckInOptions) => Promise<CheckIn>;
  findByMembershipAndDate: (
    options: FindByMembershipAndDateOptions,
  ) => Promise<O.Option<CheckIn>>;
  findManyByUserId: (options: FindManyByUserIdOptions) => Promise<CheckIn[]>;
  countByUserId: (userId: UserId) => Promise<number>;
}
