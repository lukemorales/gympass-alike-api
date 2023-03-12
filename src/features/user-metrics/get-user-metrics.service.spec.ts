import { ulid } from 'ulid';

import { type GymId } from '@features/gyms';
import { type UserId } from '@features/users';
import { Clock } from '@features/clock';
import { CheckInsInMemoryRepository } from '@features/check-ins';

import { GetUserMetricsService } from './get-user-metrics.service';

describe('GetUserMetricsService', () => {
  let clock: Clock;
  let checkInsRepository: CheckInsInMemoryRepository;
  let sut: GetUserMetricsService;

  beforeEach(() => {
    clock = new Clock();
    checkInsRepository = new CheckInsInMemoryRepository(clock);
    sut = new GetUserMetricsService(checkInsRepository, clock);
  });

  describe('execute', () => {
    const gymId = ulid() as GymId;

    const userId = ulid() as UserId;

    it('returns the check-in history for a specific user', async () => {
      const date = new Date();

      vi.spyOn(clock, 'now', 'get').mockReturnValue(date);

      await Promise.all([
        checkInsRepository.create({
          gymId,
          userId,
        }),
        checkInsRepository.create({
          gymId,
          userId,
        }),
      ]);

      const result = await sut.execute({
        userId,
      });

      expect(result).toEqual({
        userId: expect.stringContaining(userId),
        updatedAt: date,
        checkIns: {
          total: 2,
        },
      });
    });
  });
});
