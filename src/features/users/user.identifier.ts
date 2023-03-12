import { type z } from 'zod';

import { brandedEntityId } from '@shared/branded-entity-id';

export const UserId = brandedEntityId('User');

export type UserId = z.infer<typeof UserId>;
