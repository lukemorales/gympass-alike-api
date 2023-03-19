import { app } from 'src/app';
import { setupUser } from '@tests/setup-user';
import request from 'supertest';

describe('UsersController | e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /me', async () => {
    const { token } = await setupUser(app);

    const response = await request(app.server)
      .get('/v1/me')
      .set('Authorization', `Bearer ${token}`)
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
