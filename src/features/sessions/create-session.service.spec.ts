import assert from 'assert';
import bcrypt from 'bcryptjs';

import { E } from '@shared/effect';
import {
  ENCRYPTION_SALT_ROUNDS,
  UsersInMemoryRepository,
} from '@features/users';

import { CreateSessionService } from './create-session.service';

describe('CreateSessionService', () => {
  let usersRepository: UsersInMemoryRepository;
  let sut: CreateSessionService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    sut = new CreateSessionService(usersRepository);
  });

  describe('execute', () => {
    const performSetup = async () => {
      await usersRepository.create({
        name: 'John Doe',
        email: 'john@doe.com',
        passwordHash: await bcrypt.hash(
          'dummy-password',
          ENCRYPTION_SALT_ROUNDS,
        ),
      });
    };

    it('fails with an "InvalidCredentials" error if user does not exists', async () => {
      const result = await sut.execute({
        email: 'john@doe.com',
        password: 'dummy-password',
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchInlineSnapshot('InvalidCredentials {}');
    });

    it('fails with an "InvalidCredentials" error if passwords does no match', async () => {
      await performSetup();

      const result = await sut.execute({
        email: 'john@doe.com',
        password: '123456',
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchInlineSnapshot('InvalidCredentials {}');
    });

    it('authenticates the user', async () => {
      await performSetup();

      const result = await sut.execute({
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
  });
});
