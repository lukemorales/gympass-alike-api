import { z } from 'zod';

import { Email } from '@shared/branded-types';

import { UserId } from './user.identifier';

const UserEntity = z.object({
  id: UserId,
  name: z.string().min(1),
  email: Email,
  updatedAt: z.date(),
  createdAt: z.date(),
  _passwordHash: z.string().min(1),
});

export interface UserSchema extends z.input<typeof UserEntity> {}

export interface UserEntity extends z.infer<typeof UserEntity> {}

export class User implements UserEntity {
  id: UserId;

  name: string;

  email: Email;

  updatedAt: Date;

  createdAt: Date;

  _passwordHash: string;

  constructor(input: UserSchema) {
    Object.assign(this, UserEntity.parse(input));
  }
}
