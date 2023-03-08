import assert from 'assert';
import bcrypt from 'bcryptjs';

import { E } from '@shared/effect';

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
        email: 'john@doe.com',
        passwordHash: 'dummy-password',
      });

      const result = await sut.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'dummy-password',
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchInlineSnapshot(`
        EmailNotAvailable {
          "email": "john@doe.com",
        }
      `);
    });

    it('creates a user', async () => {
      const result = await sut.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'dummy-password',
      });

      assert.ok(E.isRight(result));

      const { user } = result.right;

      expect(user).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@doe.com',
        password_hash: expect.any(String),
      });
    });

    it('hashes the user password on account creation', async () => {
      const password = 'dummy-password';

      const result = await sut.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password,
      });

      assert.ok(E.isRight(result));

      const { user } = result.right;

      expect(user.password_hash).not.toBe(password);

      const isPasswordHashedCorrectly = await bcrypt.compare(
        password,
        user.password_hash,
      );

      expect(isPasswordHashedCorrectly).toBe(true);
    });
  });
});
