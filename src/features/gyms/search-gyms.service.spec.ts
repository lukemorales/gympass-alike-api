import { GymsInMemoryRepository } from '@features/gyms';

import { SearchGymsService } from './search-gyms.service';

describe('SearchGymsService', () => {
  let gymsRepository: GymsInMemoryRepository;
  let sut: SearchGymsService;

  beforeEach(() => {
    gymsRepository = new GymsInMemoryRepository();
    sut = new SearchGymsService(gymsRepository);
  });

  describe('execute', () => {
    it('returns a list of gyms that matches the expected query', async () => {
      for (let i = 0; i <= 22; i++) {
        await gymsRepository.create({
          name: `Maromba Gym ${i.toString().padStart(2, '0')}`,
          description: null,
          phone: null,
          latitude: 0.987654321,
          longitude: -0.987654321,
        });
      }

      for (let i = 23; i <= 25; i++) {
        await gymsRepository.create({
          name: `Iron Gym ${i.toString().padStart(2, '0')}`,
          description: null,
          phone: null,
          latitude: 0.987654321,
          longitude: -0.987654321,
        });
      }

      const result = await sut.execute({
        query: 'maRomBA',
      });

      expect(result).toEqual({
        items: expect.any(Array),
        metadata: {
          cursor: expect.any(String),
        },
      });

      expect(result.items).toBeArrayOfSize(20);

      expect(result.items).toIncludeAllMembers([
        expect.toContainValue(expect.stringContaining('Maromba')),
        expect.toContainValue(expect.stringContaining('Maromba')),
        expect.toContainValue(expect.stringContaining('Maromba')),
      ]);

      expect(result.items).not.toIncludeAnyMembers([
        expect.toContainValue(expect.stringContaining('Iron')),
      ]);
    });

    it('returns a paginated list of gyms that match the expected query', async () => {
      for (let i = 1; i < 20; i++) {
        await gymsRepository.create({
          name: `Maromba Gym ${i.toString().padStart(2, '0')}`,
          description: null,
          phone: null,
          latitude: 0.987654321,
          longitude: -0.987654321,
        });
      }

      const middle = await gymsRepository.create({
        name: `Maromba Gym 20`,
        description: null,
        phone: null,
        latitude: 0.987654321,
        longitude: -0.987654321,
      });

      for (let i = 21; i <= 25; i++) {
        await gymsRepository.create({
          name: `Maromba Gym ${i.toString().padStart(2, '0')}`,
          description: null,
          phone: null,
          latitude: 0.987654321,
          longitude: -0.987654321,
        });
      }

      const firstResult = await sut.execute({
        query: 'maromba',
        cursor: null,
      });

      expect(firstResult).toEqual({
        items: expect.any(Array),
        metadata: {
          cursor: middle.id,
        },
      });

      expect(firstResult.items).toBeArrayOfSize(20);

      const secondResult = await sut.execute({
        query: 'maromba',
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
