import { type Gym } from '@prisma/client';

import { type O } from '@shared/effect';

export type CreateGymOptions = {
  name: string;
  description: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
};

export interface GymsRepository {
  create: (options: CreateGymOptions) => Promise<Gym>;
  findById: (id: string) => Promise<O.Option<Gym>>;
}
