import { z } from 'zod';

export const Coords = z.object({
  lat: z.number(),
  long: z.number(),
});

export type Coords = z.infer<typeof Coords>;
