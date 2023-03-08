/* eslint-disable no-console */
import { app } from './app';

void app
  .listen({ host: '0.0.0.0', port: 3333 })
  .then(() => console.log('🚀 Server running...'));
