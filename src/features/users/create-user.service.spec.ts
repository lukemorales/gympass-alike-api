import assert from 'assert';
import bcrypt from 'bcryptjs';

import { E } from '@shared/effect';
import {
  type HashedPassword,
  type Email,
  type Password,
} from '@shared/branded-types';

import { CreateUserService } from './create-user.service';
import { UsersInMemoryRepository } from './repositories/users.in-memory.repository';

describe('CreateUserService', () => {
  let usersRepository: UsersInMemoryRepository;
  let sut: CreateUserService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    sut = new CreateUserService(usersRepository);
  });

  describe('execute', () => {
    it('does not create a user if a record with the same email exists', async () => {
      await usersRepository.create({
        name: 'John Doe',
        email: 'john@doe.com' as Email,
        passwordHash: 'dummy-password' as HashedPassword,
      });

      const result = await sut.execute({
        name: 'John Doe',
        email: 'john@doe.com' as Email,
        password: 'dummy-password' as Password,
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'EmailNotAvailable',
        email: 'john@doe.com',
      });
    });

    it('creates a user', async () => {
      const result = await sut.execute({
        name: 'John Doe',
        email: 'john@doe.com' as Email,
        password: 'dummy-password' as Password,
      });

      assert.ok(E.isRight(result));

      const { user } = result.right;

      expect(user).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@doe.com',
        _passwordHash: expect.any(String),
      });
    });

    it('hashes the user password on account creation', async () => {
      const password = 'dummy-password' as Password;

      const result = await sut.execute({
        name: 'John Doe',
        email: 'john@doe.com' as Email,
        password,
      });

      assert.ok(E.isRight(result));

      const { user } = result.right;

      expect(user._passwordHash).not.toBe(password);

      const isPasswordHashedCorrectly = await bcrypt.compare(
        password,
        user._passwordHash,
      );

      expect(isPasswordHashedCorrectly).toBe(true);
    });
  });
});
