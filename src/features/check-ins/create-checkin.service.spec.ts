import { CreateCheckInService } from './create-checkin.service';
import { CheckInsInMemoryRepository } from './repositories';

describe('CreateCheckInService', () => {
  let usersRepository: CheckInsInMemoryRepository;
  let sut: CreateCheckInService;

  beforeEach(() => {
    usersRepository = new CheckInsInMemoryRepository();
    sut = new CreateCheckInService(usersRepository);
  });

  describe('execute', () => {
    it('creates a check-in', async () => {
      const checkIn = await sut.execute({
        userId: 'user_01',
        gymId: 'gym_01',
      });

      expect(checkIn).toMatchObject({
        id: expect.any(String),
        user_id: 'user_01',
        gym_id: 'gym_01',
      });
    });
  });
});
