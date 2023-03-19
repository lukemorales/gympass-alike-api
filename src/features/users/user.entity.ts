import { z } from 'zod';

import { Email, HashedPassword } from '@shared/branded-types';

import { UserId } from './user.identifier';

export const DatabaseUserRole = z.enum(['ADMIN', 'MEMBER']);

export type DatabaseUserRole = z.infer<typeof DatabaseUserRole>;

export const UserRole = z.enum(['Admin', 'Member']);

export type UserRole = z.infer<typeof UserRole>;

const UserEntity = z.object({
  id: UserId,
  name: z.string().min(1),
  email: Email,
  role: UserRole,
  updatedAt: z.date(),
  createdAt: z.date(),
  _passwordHash: HashedPassword,
});

export interface UserSchema extends z.input<typeof UserEntity> {}

export interface UserEntity extends z.infer<typeof UserEntity> {}

export class User implements UserEntity {
  id: UserId;

  name: string;

  email: Email;

  role: UserRole;

  updatedAt: Date;

  createdAt: Date;

  _passwordHash: HashedPassword;

  constructor(input: UserSchema) {
    Object.assign(this, UserEntity.parse(input));
  }
}
