import { type FastifyInstance } from 'fastify';

import request from 'supertest';

export async function setupUser(app: FastifyInstance) {
  await request(app.server).post('/v1/users').send({
    name: 'John Doe',
    email: 'john@doe.com',
    password: '123456',
  });

  const authResponse = await request(app.server).post('/v1/sessions').send({
    email: 'john@doe.com',
    password: '123456',
  });

  const { token } = authResponse.body as { token: string };

  return { token };
}
