import assert from 'assert';

import { Clock } from '@features/clock';
import { E } from '@shared/effect';

import { CreateCheckInService } from './create-checkin.service';
import { CheckInsInMemoryRepository } from './repositories';

describe('CreateCheckInService', () => {
  let clock: Clock;
  let usersRepository: CheckInsInMemoryRepository;
  let sut: CreateCheckInService;

  beforeEach(() => {
    clock = new Clock();
    usersRepository = new CheckInsInMemoryRepository();
    sut = new CreateCheckInService(clock, usersRepository);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('execute', () => {
    it('does not create a check-in if a previous check-in exists for the same day in the same gym', async () => {
      vi.setSystemTime(new Date(2023, 2, 10, 8, 0, 0, 0));

      await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
      });

      const result = await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchInlineSnapshot(`
        DuplicatedCheckInNotAllowed {
          "date": 2023-03-10T11:00:00.000Z,
          "gymId": "gym_01",
          "tag": "DuplicatedCheckInNotAllowed",
        }
      `);
    });

    it('creates a check-in', async () => {
      const result = await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
      });

      assert.ok(E.isRight(result));

      const { checkIn } = result.right;

      expect(checkIn).toMatchObject({
        id: expect.any(String),
        user_id: 'user_01',
        gym_id: 'gym_01',
      });
    });
  });
});
