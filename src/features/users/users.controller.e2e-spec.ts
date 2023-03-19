import { app } from 'src/app';
import request from 'supertest';

describe('UsersController | e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /me', async () => {
    await request(app.server)
      .post('/v1/users')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201);

    const authResponse = await request(app.server)
      .post('/v1/sessions')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(200);

    const response = await request(app.server)
      .get('/v1/me')
      .set('Authorization', `Bearer ${authResponse.body.token}`)
      .expect(200);

    expect(response.body).toEqual({
      user: expect.objectContaining({
        id: expect.any(String),
        email: 'john@doe.com',
      }),
    });
  });

  it('POST /', async () => {
    await request(app.server)
      .post('/v1/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '123456',
      })
      .expect(201);
  });
});
