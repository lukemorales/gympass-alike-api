import { setupUser } from '@tests/setup-user';
import { addKilometersToCoords } from '@tests/utils';
import { app } from 'src/app';
import request from 'supertest';

describe('GymsController | e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /', async () => {
    const { token } = await setupUser(app);

    const response = await request(app.server)
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

    expect(response.body).toEqual({
      gym: expect.objectContaining({
        name: 'Maromba Gym',
      }),
    });
  });

  it('GET /search', async () => {
    const { token } = await setupUser(app);

    await request(app.server)
      .post('/v1/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Marombeiros Gym',
        description: 'The place for gym-bros!',
        phone: null,
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      })
      .expect(201);

    await request(app.server)
      .post('/v1/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Iron Gym',
        description: 'The place for weight-lifters!',
        phone: null,
        coords: {
          lat: 0.987654312,
          long: -0.987654312,
        },
      })
      .expect(201);

    const response = await request(app.server)
      .get('/v1/gyms/search')
      .set('Authorization', `Bearer ${token}`)
      .query({
        query: 'maRomBeiROs',
      })
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
        name: 'Marombeiros Gym',
      }),
    ]);

    expect(response.body.items).not.toIncludeAnyMembers([
      expect.objectContaining({
        name: 'Iron Gym',
      }),
    ]);
  });

  it('GET /nearby', async () => {
    const baseCoords = {
      lat: 0.123456789,
      long: -0.123456789,
    };

    const { token } = await setupUser(app);

    await request(app.server)
      .post('/v1/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Nearby Gym',
        description: 'The place near you!',
        phone: null,
        coords: baseCoords,
      })
      .expect(201);

    await request(app.server)
      .post('/v1/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Far Away Gym',
        description: 'The place so far away from home you will never exercise!',
        phone: null,
        coords: addKilometersToCoords(15, baseCoords),
      })
      .expect(201);

    const response = await request(app.server)
      .get('/v1/gyms/nearby')
      .set('Authorization', `Bearer ${token}`)
      .query({
        lat: 0.123456798,
        long: -0.123456798,
      })
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
        name: 'Nearby Gym',
      }),
    ]);

    expect(response.body.items).not.toIncludeAnyMembers([
      expect.objectContaining({
        name: 'Far Away Gym',
      }),
    ]);
  });
});
