import assert from 'assert';
import { Decimal } from '@prisma/client/runtime/library';

import { Clock } from '@features/clock';
import { E } from '@shared/effect';
import { GymsInMemoryRepository } from '@features/gyms';

import { CreateCheckInService } from './create-checkin.service';
import { CheckInsInMemoryRepository } from './repositories';

describe('CreateCheckInService', () => {
  let clock: Clock;
  let checkInsRepository: CheckInsInMemoryRepository;
  let gymsRepository: GymsInMemoryRepository;
  let sut: CreateCheckInService;

  beforeEach(() => {
    clock = new Clock();
    checkInsRepository = new CheckInsInMemoryRepository();
    gymsRepository = new GymsInMemoryRepository();
    sut = new CreateCheckInService(clock, checkInsRepository, gymsRepository);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('execute', () => {
    const performSetup = async () => {
      gymsRepository.repository.push(
        {
          id: 'gym_01',
          name: 'Maromba Gym',
          phone: null,
          description: '',
          latitude: new Decimal(0.987654321),
          longitude: new Decimal(-0.987654321),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'gym_02',
          name: 'Super Maromba Gym',
          phone: null,
          description: '',
          latitude: new Decimal(0.123456789),
          longitude: new Decimal(-0.123456789),
          created_at: new Date(),
          updated_at: new Date(),
        },
      );
    };

    beforeEach(async () => {
      await performSetup();
    });

    it('fails with a "ResourceNotFound" error if the gym does not exist', async () => {
      const result = await sut.execute({
        userId: 'user_01',
        gymId: 'gym_invalid_id',
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchInlineSnapshot(`
        ResourceNotFound {
          "resourceId": "gym_invalid_id",
          "tag": "ResourceNotFound",
        }
      `);
    });

    it('fails with a "DuplicateCheckInNotAllowed" error if a previous check-in exists for the same day in the same gym', async () => {
      vi.setSystemTime(new Date(2023, 2, 10, 8, 0, 0, 0));

      await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      const result = await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchInlineSnapshot(`
        DuplicateCheckInNotAllowed {
          "date": 2023-03-10T11:00:00.000Z,
          "gymId": "gym_01",
          "tag": "DuplicateCheckInNotAllowed",
        }
      `);
    });

    it('fails with a "NotOnLocation" error if distance from gym is greater than allowed', async () => {
      const result = await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
        coords: {
          lat: 0.917257389,
          long: -0.987654321,
        },
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchInlineSnapshot(`
        NotOnLocation {
          "distance": 7.827405088086411,
          "tag": "NotOnLocation",
        }
      `);
    });

    it('creates a check-in', async () => {
      const result = await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      assert.ok(E.isRight(result));

      const { checkIn } = result.right;

      expect(checkIn).toMatchObject({
        id: expect.any(String),
        user_id: 'user_01',
        gym_id: 'gym_01',
      });
    });

    it('creates another check-in in the same day on a different gym', async () => {
      vi.setSystemTime(new Date(2023, 2, 10, 8, 0, 0, 0));

      await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      const result = await sut.execute({
        userId: 'user_01',
        gymId: 'gym_02',
        coords: {
          lat: 0.123456789,
          long: -0.123456789,
        },
      });

      assert.ok(E.isRight(result));

      const { checkIn } = result.right;

      expect(checkIn).toMatchObject({
        id: expect.any(String),
        user_id: 'user_01',
        gym_id: 'gym_02',
      });
    });
  });
});
