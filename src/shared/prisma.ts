import { PrismaClient } from '@prisma/client';

import { ENV } from './env';

export const prisma = new PrismaClient({
  log: ENV.NODE_ENV === 'development' ? ['query'] : [],
});
