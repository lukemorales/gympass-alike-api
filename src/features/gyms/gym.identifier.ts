import { type z } from 'zod';

import { brandedEntityId } from '@shared/branded-entity-id';

export const GymId = brandedEntityId('Gym');

export type GymId = z.infer<typeof GymId>;
