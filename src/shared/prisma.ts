import { PrismaClient } from '@prisma/client';
import { ENV } from '@config/env';

export const prisma = new PrismaClient({
  log: ENV.NODE_ENV === 'development' ? ['query'] : [],
});
