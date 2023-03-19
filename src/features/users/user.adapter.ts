import { type User as UserModel } from '@prisma/client';
import { exhaustive } from 'exhaustive';

import { type DatabaseUserRole, User, UserRole } from './user.entity';

export class UserAdapter {
  static toDomain(model: UserModel) {
    return new User({
      id: model.id,
      name: model.name,
      email: model.email,
      role: exhaustive(model.role as DatabaseUserRole, {
        ADMIN: () => UserRole.enum.Admin,
        MEMBER: () => UserRole.enum.Member,
      }),
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
      role: domain.role,
      updatedAt: domain.updatedAt,
      createdAt: domain.createdAt,
    };
  }
}
