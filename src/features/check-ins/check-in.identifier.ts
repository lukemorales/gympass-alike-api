import { type z } from 'zod';

import { brandedEntityId } from '@shared/branded-entity-id';

export const CheckInId = brandedEntityId('CheckIn');

export type CheckInId = z.infer<typeof CheckInId>;
