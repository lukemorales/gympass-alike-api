import { app } from 'src/app';
import request from 'supertest';

describe('UsersController | e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201);
  });
});
