import assert from 'assert';
import bcrypt from 'bcryptjs';

import { E } from '@shared/effect';

import { CreateUserService } from './create-user.service';
import { UsersInMemoryRepository } from './repositories/users.in-memory.repository';
import { type UsersRepository } from './repositories/users.repository';

describe('createUserService', () => {
  let usersRepository: UsersRepository;
  let createUserService: CreateUserService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    createUserService = new CreateUserService(usersRepository);
  });

  describe('execute', () => {
    it('hashes the user password on account creation', async () => {
      const result = await createUserService.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'dummy-password',
      });

      assert.ok(E.isRight(result));

      const { user } = result.right;

      expect(user.password_hash).not.toBe('dummy-password');

      const isPasswordHashedCorrectly = await bcrypt.compare(
        'dummy-password',
        user.password_hash,
      );

      expect(isPasswordHashedCorrectly).toBe(true);
    });
  });
});
