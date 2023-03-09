import { ulid } from 'ulid';
import { type CheckIn } from '@prisma/client';

import {
  type CreateCheckInOptions,
  type CheckInsRepository,
} from './check-ins.repository';

export class CheckInsInMemoryRepository implements CheckInsRepository {
  readonly repository: CheckIn[] = [];

  async create({ gymId, userId }: CreateCheckInOptions) {
    const checkIn: CheckIn = {
      id: ulid(),
      gym_id: gymId,
      user_id: userId,
      validated_at: null,
      updated_at: new Date(),
      created_at: new Date(),
    };

    this.repository.push(checkIn);

    return checkIn;
  }
}
