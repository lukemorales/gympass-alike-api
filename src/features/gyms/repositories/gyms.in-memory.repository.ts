import { type Gym } from '@prisma/client';

import { A, pipe } from '@shared/effect';

import { type GymsRepository } from './gyms.repository';

export class GymsInMemoryRepository implements GymsRepository {
  readonly repository: Gym[] = [];

  async findById(id: string) {
    return pipe(
      this.repository,
      A.findFirst((gym) => gym.id === id),
    );
  }
}
