import { type Gym } from '@prisma/client';

import { type O } from '@shared/effect';

export interface GymsRepository {
  findById: (id: string) => Promise<O.Option<Gym>>;
}
