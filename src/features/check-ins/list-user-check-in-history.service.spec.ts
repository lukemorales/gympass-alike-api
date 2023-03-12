import { ulid } from 'ulid';

import { type GymId } from '@features/gyms';
import { type UserId } from '@features/users';
import { Clock } from '@features/clock';

import { CheckInsInMemoryRepository } from './repositories';
import { ListUserCheckInHistoryService } from './list-user-check-in-history.service';

describe('ListUserCheckInHistoryService', () => {
  let clock: Clock;
  let checkInsRepository: CheckInsInMemoryRepository;
  let sut: ListUserCheckInHistoryService;

  beforeEach(() => {
    clock = new Clock();
    checkInsRepository = new CheckInsInMemoryRepository(clock);
    sut = new ListUserCheckInHistoryService(checkInsRepository);
  });

  describe('execute', () => {
    const gymId = ulid() as GymId;
    const gym2Id = ulid() as GymId;

    const userId = ulid() as UserId;
    const user2Id = ulid() as UserId;

    it('returns the check-in history for a specific user', async () => {
      await Promise.all([
        checkInsRepository.create({
          gymId,
          userId,
        }),
        checkInsRepository.create({
          gymId: gym2Id,
          userId,
        }),
        checkInsRepository.create({
          gymId: ulid() as GymId,
          userId,
        }),
        checkInsRepository.create({
          gymId,
          userId: user2Id,
        }),
        checkInsRepository.create({
          gymId: gym2Id,
          userId: user2Id,
        }),
      ]);

      const result = await sut.execute({
        userId,
      });

      expect(result).toEqual({
        items: expect.any(Array),
        metadata: {
          cursor: null,
        },
      });

      expect(result.items).toBeArrayOfSize(3);

      expect(result.items).toIncludeAllMembers([
        expect.toContainValue(expect.stringContaining(userId)),
        expect.toContainValue(expect.stringContaining(userId)),
        expect.toContainValue(expect.stringContaining(userId)),
      ]);

      expect(result.items).not.toIncludeAnyMembers([
        expect.toContainValue(expect.stringContaining(user2Id)),
      ]);
    });

    it('returns a paginated check-in history for a specific user', async () => {
      const first = await checkInsRepository.create({
        gymId: ulid() as GymId,
        userId,
      });

      for (let i = 1; i < 20; i++) {
        await checkInsRepository.create({
          gymId: ulid() as GymId,
          userId,
        });
      }

      const middle = await checkInsRepository.create({
        gymId: ulid() as GymId,
        userId,
      });

      for (let i = 21; i <= 25; i++) {
        await checkInsRepository.create({
          gymId: ulid() as GymId,
          userId,
        });
      }

      const firstResult = await sut.execute({
        userId,
        cursor: first.id,
      });

      expect(firstResult).toEqual({
        items: expect.any(Array),
        metadata: {
          cursor: middle.id,
        },
      });

      expect(firstResult.items).toBeArrayOfSize(20);

      const secondResult = await sut.execute({
        userId,
        cursor: firstResult.metadata.cursor,
      });

      expect(secondResult).toEqual({
        items: expect.any(Array),
        metadata: {
          cursor: null,
        },
      });

      expect(secondResult.items).toBeArrayOfSize(5);
    });
  });
});
