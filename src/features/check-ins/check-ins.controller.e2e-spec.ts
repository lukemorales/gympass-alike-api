import { setupUser } from '@tests/setup-user';
import { app } from 'src/app';
import request from 'supertest';

import { prisma } from '@shared/prisma';

describe('CheckInsController | e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await prisma.checkIn.deleteMany({
      where: { id: { not: '' } },
    });
    await prisma.gym.deleteMany({
      where: { id: { not: '' } },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /history', async () => {
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
      .get('/v1/check-ins/history')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      items: expect.any(Array),
      metadata: {
        cursor: null,
      },
    });

    expect(response.body.items).toBeArrayOfSize(1);

    expect(response.body.items).toIncludeAllMembers([
      expect.objectContaining({
        gymId: body.gym.id,
      }),
    ]);

    expect(response.body.items).not.toIncludeAnyMembers([
      expect.objectContaining({
        name: 'Iron Gym',
      }),
    ]);
  });

  it('POST /gyms/:gymId/check-ins', async () => {
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

    const response = await request(app.server)
      .post(`/v1/gyms/${body.gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      })
      .expect(201);

    expect(response.body).toEqual({
      checkIn: expect.objectContaining({
        gymId: body.gym.id,
      }),
    });
  });

  it('PATCH /check-ins/:checkInId/validate', async () => {
    const { token } = await setupUser(app);

    const { body: gymBody } = await request(app.server)
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

    const { body } = await request(app.server)
      .post(`/v1/gyms/${gymBody.gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      })
      .expect(201);

    const response = await request(app.server)
      .patch(`/v1/check-ins/${body.checkIn.id}/validate`)
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200);

    expect(response.body).toEqual({
      checkIn: expect.objectContaining({
        gymId: gymBody.gym.id,
        validatedAt: expect.any(String),
      }),
    });
  });
});
