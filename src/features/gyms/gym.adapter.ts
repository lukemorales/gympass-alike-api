import { type Gym as GymModel } from '@prisma/client';

import { Gym } from './gym.entity';

export class GymAdapter {
  static toDomain(model: GymModel) {
    return new Gym({
      id: model.id,
      name: model.name,
      phone: model.phone,
      description: model.description,
      coords: {
        lat: model.latitude.toNumber(),
        long: model.longitude.toNumber(),
      },
      updatedAt: model.updated_at,
      createdAt: model.created_at,
    });
  }

  static toJSON(domain: Gym) {
    return {
      id: domain.id.toString(),
      name: domain.name,
      description: domain.description,
      phone: domain.phone,
      coords: domain.coords,
      updatedAt: domain.updatedAt,
      createdAt: domain.createdAt,
    };
  }
}
