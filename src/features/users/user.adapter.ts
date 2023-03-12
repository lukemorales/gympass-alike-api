import { type User as UserModel } from '@prisma/client';

import { User } from './user.entity';

export class UserAdapter {
  static toDomain(model: UserModel) {
    return new User({
      id: model.id,
      name: model.name,
      email: model.email,
      _passwordHash: model.password_hash,
      updatedAt: model.updated_at,
      createdAt: model.created_at,
    });
  }

  static toJSON(domain: User) {
    return {
      id: domain.id.toString(),
      name: domain.name,
      email: domain.email.toString(),
      updatedAt: domain.updatedAt,
      createdAt: domain.createdAt,
    };
  }
}
