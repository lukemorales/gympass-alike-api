/* eslint-disable no-console */
import { app } from './app';
import { ENV } from './shared/env';

void app
  .listen({ host: '0.0.0.0', port: ENV.PORT })
  .then(() => console.log(`🚀 Server running on port ${ENV.PORT}`));
