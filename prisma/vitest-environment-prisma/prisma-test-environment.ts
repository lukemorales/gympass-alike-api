/* eslint-disable import/no-extraneous-dependencies */
import 'dotenv/config';

import { type Environment } from 'vitest';
import { ulid } from 'ulid';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

function generateDatabaseUrl(schema: string) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL missing in environment file');
  }

  const url = new URL(databaseUrl);
  url.searchParams.set('schema', schema);

  return url.toString();
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default <Environment>{
  name: 'prisma',
  async setup() {
    const schema = ulid();

    const databaseUrl = generateDatabaseUrl(schema);
    process.env.DATABASE_URL = databaseUrl;

    execSync('npx prisma migrate deploy');

    return {
      async teardown(_global) {
        const prisma = new PrismaClient();

        await prisma.$executeRawUnsafe(`
          DROP SCHEMA IF EXISTS "${schema}" CASCADE
        `);

        await prisma.$disconnect();
      },
    };
  },
};
