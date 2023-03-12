import assert from 'assert';
import { ulid } from 'ulid';

import { Clock } from '@features/clock';
import { E } from '@shared/effect';
import { type Gym, GymsInMemoryRepository, type GymId } from '@features/gyms';
import { type UserId } from '@features/users';

import { CreateCheckInService } from './create-check-in.service';
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
    const userId = ulid() as UserId;

    let gym01: Gym;
    let gym02: Gym;

    const performSetup = async () =>
      Promise.all([
        gymsRepository.create({
          name: 'Maromba Gym',
          phone: null,
          description: null,
          latitude: 0.987654321,
          longitude: -0.987654321,
        }),
        gymsRepository.create({
          name: 'Super Maromba Gym',
          phone: null,
          description: null,
          latitude: 0.123456789,
          longitude: -0.123456789,
        }),
      ]);

    beforeEach(async () => {
      [gym01, gym02] = await performSetup();
    });

    it('fails with a "ResourceNotFound" error if the gym does not exist', async () => {
      const result = await sut.execute({
        userId,
        gymId: 'gym_invalid_id' as GymId,
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'ResourceNotFound',
        resourceId: 'gym_invalid_id',
      });
    });

    it('fails with a "DuplicateCheckInNotAllowed" error if a previous check-in exists for the same day in the same gym', async () => {
      const date = new Date(2023, 2, 10, 8, 0, 0, 0);
      vi.setSystemTime(date);

      await sut.execute({
        userId,
        gymId: gym01.id,
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      const result = await sut.execute({
        userId,
        gymId: gym01.id,
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'DuplicateCheckInNotAllowed',
        date,
        gymId: gym01.id,
      });
    });

    it('fails with a "NotOnLocation" error if distance from gym is greater than allowed', async () => {
      const result = await sut.execute({
        userId,
        gymId: gym01.id,
        coords: {
          lat: 0.917257389,
          long: -0.987654321,
        },
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'NotOnLocation',
        distance: 7.827405088086411,
      });
    });

    it('creates a check-in', async () => {
      const result = await sut.execute({
        userId,
        gymId: gym01.id,
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      assert.ok(E.isRight(result));

      const { checkIn } = result.right;

      expect(checkIn).toMatchObject({
        id: expect.any(String),
        userId: expect.stringContaining(userId),
        gymId: gym01.id,
      });
    });

    it('creates another check-in in the same day on a different gym', async () => {
      vi.setSystemTime(new Date(2023, 2, 10, 8, 0, 0, 0));

      await sut.execute({
        userId,
        gymId: gym01.id,
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        },
      });

      const result = await sut.execute({
        userId,
        gymId: gym02.id,
        coords: {
          lat: 0.123456789,
          long: -0.123456789,
        },
      });

      assert.ok(E.isRight(result));

      const { checkIn } = result.right;

      expect(checkIn).toMatchObject({
        id: expect.any(String),
        userId: expect.stringContaining(userId),
        gymId: gym02.id,
      });
    });
  });
});
