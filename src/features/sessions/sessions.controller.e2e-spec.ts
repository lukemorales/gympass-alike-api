import { app } from 'src/app';
import request from 'supertest';

describe('SessionsController | e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /', async () => {
    await request(app.server)
      .post('/v1/users')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201);

    const response = await request(app.server)
      .post('/v1/sessions')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(200);

    expect(response.body).toEqual({
      token: expect.any(String),
    });
  });
});
