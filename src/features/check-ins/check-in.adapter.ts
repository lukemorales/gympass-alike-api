import { type CheckIn as CheckInModel } from '@prisma/client';

import { CheckIn } from './check-in.entity';

export class CheckInAdapter {
  static toDomain(model: CheckInModel) {
    return new CheckIn({
      id: model.id,
      gymId: model.gym_id,
      userId: model.user_id,
      validatedAt: model.validated_at,
      createdAt: model.created_at,
    });
  }

  static toJSON(domain: CheckIn) {
    return {
      id: domain.id.toString(),
      gymId: domain.gymId,
      userId: domain.userId,
      validatedAt: domain.validatedAt,
      createdAt: domain.createdAt,
    };
  }
}
