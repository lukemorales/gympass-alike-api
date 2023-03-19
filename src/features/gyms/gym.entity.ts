import { z } from 'zod';

import { Coords } from '../../shared/coordinates.schema';
import { GymId } from './gym.identifier';

const GymEntity = z.object({
  id: GymId,
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  phone: z.string().min(1).nullable(),
  coords: Coords,
  updatedAt: z.date(),
  createdAt: z.date(),
});

export interface GymSchema extends z.input<typeof GymEntity> {}

export interface GymEntity extends z.infer<typeof GymEntity> {}

export class Gym implements GymEntity {
  id: GymId;

  name: string;

  description: string | null;

  phone: string | null;

  coords: Coords;

  updatedAt: Date;

  createdAt: Date;

  constructor(input: GymSchema) {
    Object.assign(this, GymEntity.parse(input));
  }
}
