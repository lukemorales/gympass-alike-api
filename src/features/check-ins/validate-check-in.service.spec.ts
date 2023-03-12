import assert from 'assert';
import { ulid } from 'ulid';
import dayjs from 'dayjs';

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

    it('fails with a "ExpiredCheckIn" error if trying to validate check-in after 20 minutes of its creation', async () => {
      const checkInCreationDate = new Date();

      vi.spyOn(clock, 'now', 'get').mockReturnValueOnce(checkInCreationDate);

      const checkIn = await checkInsRepository.create({
        gymId: ulid() as GymId,
        userId: ulid() as UserId,
      });

      const checkInValidationDate = dayjs(checkInCreationDate).add(
        25,
        'minutes',
      );

      vi.spyOn(clock, 'now', 'get').mockReturnValueOnce(
        checkInValidationDate.toDate(),
      );

      const result = await sut.execute({
        checkInId: checkIn.id,
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'ExpiredCheckIn',
        checkInId: checkIn.id,
      });
    });

    it('validates a check-in', async () => {
      const checkInCreationDate = new Date();

      vi.spyOn(clock, 'now', 'get').mockReturnValueOnce(checkInCreationDate);

      const checkIn = await checkInsRepository.create({
        gymId: ulid() as GymId,
        userId: ulid() as UserId,
      });

      const checkInValidationDate = dayjs(checkInCreationDate).add(
        15,
        'minutes',
      );

      vi.spyOn(clock, 'now', 'get').mockReturnValueOnce(
        checkInValidationDate.toDate(),
      );

      const result = await sut.execute({
        checkInId: checkIn.id,
      });

      assert.ok(E.isRight(result));

      const validatedCheckIn = result.right.checkIn;

      expect(validatedCheckIn).toMatchObject({
        validatedAt: checkInValidationDate.toDate(),
      });

      expect(checkInsRepository.repository[0]).toMatchObject({
        validated_at: checkInValidationDate.toDate(),
      });
    });
  });
});
