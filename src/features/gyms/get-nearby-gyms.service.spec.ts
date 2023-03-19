import { addKilometersToCoords } from 'src/tests/utils';

import { GymsInMemoryRepository } from '@features/gyms';
import { type Coords } from '@shared/coordinates.schema';

import { GetNearbyGymsService } from './get-nearby-gyms.service';

describe('GetNearbyGymsService', () => {
  let gymsRepository: GymsInMemoryRepository;
  let sut: GetNearbyGymsService;

  beforeEach(() => {
    gymsRepository = new GymsInMemoryRepository();
    sut = new GetNearbyGymsService(gymsRepository);
  });

  describe('execute', () => {
    it('returns a list of gyms that are within the maximum radius limit', async () => {
      const baseCoords = {
        lat: 0.987654321,
        long: -0.987654321,
      } as Coords;

      for (let i = 0; i <= 3; i++) {
        const distantCoords = addKilometersToCoords(15, baseCoords);

        await gymsRepository.create({
          name: `Far Away Gym ${i.toString().padStart(2, '0')}`,
          description: null,
          phone: null,
          latitude: distantCoords.lat,
          longitude: distantCoords.long,
        });
      }

      for (let i = 4; i <= 25; i++) {
        await gymsRepository.create({
          name: `Nearby Gym ${i.toString().padStart(2, '0')}`,
          description: null,
          phone: null,
          latitude: baseCoords.lat,
          longitude: baseCoords.long,
        });
      }

      const result = await sut.execute({
        coords: baseCoords,
      });

      expect(result).toEqual({
        items: expect.any(Array),
        metadata: {
          cursor: expect.any(String),
        },
      });

      expect(result.items).toBeArrayOfSize(20);

      expect(result.items).toIncludeAllMembers([
        expect.toContainValue(expect.stringContaining('Nearby')),
        expect.toContainValue(expect.stringContaining('Nearby')),
        expect.toContainValue(expect.stringContaining('Nearby')),
      ]);

      expect(result.items).not.toIncludeAnyMembers([
        expect.toContainValue(expect.stringContaining('Far Away')),
      ]);
    });

    it('returns a paginated list of gyms that are within the maximum radius limit', async () => {
      const baseCoords = {
        lat: 0.987654321,
        long: -0.987654321,
      } as Coords;

      for (let i = 1; i < 20; i++) {
        await gymsRepository.create({
          name: `Maromba Gym ${i.toString().padStart(2, '0')}`,
          description: null,
          phone: null,
          latitude: baseCoords.lat,
          longitude: baseCoords.long,
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
          latitude: baseCoords.lat,
          longitude: baseCoords.long,
        });
      }

      const firstResult = await sut.execute({
        coords: baseCoords,
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
        coords: baseCoords,
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
