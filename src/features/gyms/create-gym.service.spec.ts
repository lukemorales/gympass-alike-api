import { type Coords } from './coords.schema';
import { CreateGymService } from './create-gym.service';
import { GymsInMemoryRepository } from './repositories/gyms.in-memory.repository';

describe('CreateGymService', () => {
  let gymsRepository: GymsInMemoryRepository;
  let sut: CreateGymService;

  beforeEach(() => {
    gymsRepository = new GymsInMemoryRepository();
    sut = new CreateGymService(gymsRepository);
  });

  describe('execute', () => {
    it('creates a gym', async () => {
      const gym = await sut.execute({
        name: 'Maromba Gym',
        description: null,
        phone: null,
        coords: {
          lat: 0.987654321,
          long: -0.987654321,
        } as Coords,
      });

      expect(gym).toMatchObject({
        id: expect.any(String),
        name: 'Maromba Gym',
      });
    });
  });
});
