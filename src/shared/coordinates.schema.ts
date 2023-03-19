import { z } from 'zod';

export const Coords = z
  .object({
    lat: z.number().refine((latitute) => Math.abs(latitute) <= 90),
    long: z.number().refine((longitude) => Math.abs(longitude) <= 180),
  })
  .brand<'Coords'>();

export type Coords = z.infer<typeof Coords>;
