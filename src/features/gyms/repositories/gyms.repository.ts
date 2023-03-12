import { type O } from '@shared/effect';

import { type Gym } from '../gym.entity';
import { type GymId } from '../gym.identifier';

export type CreateGymOptions = {
  name: string;
  description: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
};

export type SearchGymsOptions = {
  query: string;
  cursor?: GymId;
};

export interface GymsRepository {
  create: (options: CreateGymOptions) => Promise<Gym>;
  findById: (id: GymId) => Promise<O.Option<Gym>>;
  searchMany: (options: SearchGymsOptions) => Promise<Gym[]>;
}
