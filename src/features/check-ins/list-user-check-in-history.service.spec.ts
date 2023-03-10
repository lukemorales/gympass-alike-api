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
    it('returns the list of check-ins for a specific user', async () => {
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

      const checkins = await sut.execute({
        userId: 'user_01',
      });

      expect(checkins).toBeArrayOfSize(3);

      expect(checkins).toIncludeAllMembers([
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

      expect(checkins).not.toIncludeAnyMembers([
        expect.objectContaining({
          user_id: 'user_02',
        }),
      ]);
    });
  });
});
