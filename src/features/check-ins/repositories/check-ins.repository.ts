import { type GymId } from '@features/gyms';
import { type UserId } from '@features/users';
import { type Optional, type O, type E } from '@shared/effect';
import { type ResourceNotFound } from '@shared/failures';

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

export type UpdateCheckInOptions = Optional<{
  validatedAt: Date;
}>;

export interface CheckInsRepository {
  create: (options: CreateCheckInOptions) => Promise<CheckIn>;
  update: (
    id: CheckInId,
    options: UpdateCheckInOptions,
  ) => Promise<E.Either<ResourceNotFound, CheckIn>>;
  findById: (id: CheckInId) => Promise<O.Option<CheckIn>>;
  findByMembershipAndDate: (
    options: FindByMembershipAndDateOptions,
  ) => Promise<O.Option<CheckIn>>;
  findManyByUserId: (options: FindManyByUserIdOptions) => Promise<CheckIn[]>;
  countByUserId: (userId: UserId) => Promise<number>;
}
