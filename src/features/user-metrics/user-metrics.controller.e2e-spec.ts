import { setupUser } from '@tests/setup-user';
import { app } from 'src/app';
import request from 'supertest';

describe('UserMetricsController | e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /me/metrics', async () => {
    const { token } = await setupUser(app);

    const { body } = await request(app.server)
      .post('/v1/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Maromba Gym',
        description: 'The place for gym-bros!',
        phone: null,
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      })
      .expect(201);

    await request(app.server)
      .post(`/v1/gyms/${body.gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      })
      .expect(201);

    const response = await request(app.server)
      .get('/v1/me/metrics')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      checkIns: {
        total: 1,
      },
    });
  });
});
