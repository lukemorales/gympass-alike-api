import { exhaustive } from 'exhaustive';

import { ENV } from './env';

export const ENCRYPTION_SALT_ROUNDS = exhaustive(ENV.NODE_ENV, {
  test: () => 1,
  development: () => 6,
  production: () => 10,
});
