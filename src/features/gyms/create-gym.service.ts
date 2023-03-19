import { z } from 'zod';

import { Coords } from '../../shared/coordinates.schema';
import { type Gym } from './gym.entity';
import { type GymsRepository } from './repositories';

export const createGymPayload = z.object({
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  phone: z.string().min(1).nullable(),
  coords: Coords,
});

type CreateGymPayload = z.infer<typeof createGymPayload>;

export class CreateGymService {
  constructor(private readonly gymRepository: GymsRepository) {}

  async execute(payload: CreateGymPayload): Promise<Gym> {
    const { name, description, phone, coords } = payload;

    const gym = await this.gymRepository.create({
      name,
      description,
      phone,
      latitude: coords.lat,
      longitude: coords.long,
    });

    return gym;
  }
}
