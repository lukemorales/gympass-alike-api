import assert from 'assert';
import { ulid } from 'ulid';

import { Clock } from '@features/clock';
import { E } from '@shared/effect';
import { type UserId } from '@features/users';
import { type GymId } from '@features/gyms';

import { CheckInsInMemoryRepository } from './repositories';
import { ValidateCheckInService } from './validate-check-in.service';
import { type CheckInId } from './check-in.identifier';

describe('ValidCheckInService', () => {
  let clock: Clock;
  let checkInsRepository: CheckInsInMemoryRepository;
  let sut: ValidateCheckInService;

  beforeEach(() => {
    clock = new Clock();
    checkInsRepository = new CheckInsInMemoryRepository(clock);

    sut = new ValidateCheckInService(checkInsRepository, clock);
  });

  describe('execute', () => {
    it('fails with a "ResourceNotFound" error if the check-in does not exist', async () => {
      const result = await sut.execute({
        checkInId: 'invalid-check-in-id' as CheckInId,
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'ResourceNotFound',
        resourceId: 'invalid-check-in-id',
      });
    });

    it('validates a check-in', async () => {
      const checkIn = await checkInsRepository.create({
        gymId: ulid() as GymId,
        userId: ulid() as UserId,
      });

      const date = new Date();

      vi.spyOn(clock, 'now', 'get').mockReturnValue(date);

      const result = await sut.execute({
        checkInId: checkIn.id,
      });

      assert.ok(E.isRight(result));

      const validatedCheckIn = result.right.checkIn;

      expect(validatedCheckIn).toMatchObject({
        validatedAt: date,
      });

      expect(checkInsRepository.repository[0]).toMatchObject({
        validated_at: date,
      });
    });
  });
});
