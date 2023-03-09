import { type CheckIn } from '@prisma/client';

export type CreateCheckInOptions = {
  userId: string;
  gymId: string;
};

export interface CheckInsRepository {
  create: (payload: CreateCheckInOptions) => Promise<CheckIn>;
}
