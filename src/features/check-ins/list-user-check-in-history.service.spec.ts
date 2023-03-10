import { CheckInsInMemoryRepository } from './repositories';
import { ListUserCheckInHistoryService } from './list-user-check-in-history.service';

describe('ListUserCheckInHistoryService', () => {
  let checkInsRepository: CheckInsInMemoryRepository;
  let sut: ListUserCheckInHistoryService;

  beforeEach(() => {
    checkInsRepository = new CheckInsInMemoryRepository();
    sut = new ListUserCheckInHistoryService(checkInsRepository);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('execute', () => {
    it('returns the check-in history for a specific user', async () => {
      await Promise.all([
        checkInsRepository.create({
          gymId: 'gym_01',
          userId: 'user_01',
        }),
        checkInsRepository.create({
          gymId: 'gym_02',
          userId: 'user_01',
        }),
        checkInsRepository.create({
          gymId: 'gym_03',
          userId: 'user_01',
        }),
        checkInsRepository.create({
          gymId: 'gym_01',
          userId: 'user_02',
        }),
        checkInsRepository.create({
          gymId: 'gym_02',
          userId: 'user_02',
        }),
      ]);

      const result = await sut.execute({
        userId: 'user_01',
      });

      expect(result).toEqual({
        items: expect.any(Array),
        metadata: {
          cursor: null,
        },
      });

      expect(result.items).toBeArrayOfSize(3);

      expect(result.items).toIncludeAllMembers([
        expect.objectContaining({
          user_id: 'user_01',
        }),
        expect.objectContaining({
          user_id: 'user_01',
        }),
        expect.objectContaining({
          user_id: 'user_01',
        }),
      ]);

      expect(result.items).not.toIncludeAnyMembers([
        expect.objectContaining({
          user_id: 'user_02',
        }),
      ]);
    });

    it('returns a paginated check-in history for a specific user', async () => {
      const first = await checkInsRepository.create({
        gymId: `gym_00`,
        userId: 'user_01',
      });

      for (let i = 1; i < 20; i++) {
        await checkInsRepository.create({
          gymId: `gym_${i.toString().padStart(2, '0')}`,
          userId: 'user_01',
        });
      }

      const middle = await checkInsRepository.create({
        gymId: `gym_20`,
        userId: 'user_01',
      });

      for (let i = 21; i <= 25; i++) {
        await checkInsRepository.create({
          gymId: `gym_${i.toString().padStart(2, '0')}`,
          userId: 'user_01',
        });
      }

      const firstResult = await sut.execute({
        userId: 'user_01',
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
        userId: 'user_01',
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
