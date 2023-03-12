import { z } from 'zod';

import { GymId } from './gym.identifier';

const GymEntity = z.object({
  id: GymId,
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  phone: z.string().min(1).nullable(),
  coords: z.strictObject({
    lat: z.number(),
    long: z.number(),
  }),
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

  coords: Record<'lat' | 'long', number>;

  updatedAt: Date;

  createdAt: Date;

  constructor(input: GymSchema) {
    Object.assign(this, GymEntity.parse(input));
  }
}
