import assert from 'assert';

import { E } from '@shared/effect';
import { UsersInMemoryRepository } from '@features/users';
import { type Password, type Email } from '@shared/branded-types';
import { encryptPassword } from '@shared/encrypt-password';

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
        email: 'john@doe.com' as Email,
        passwordHash: await encryptPassword('dummy-password' as Password),
      });
    };

    it('fails with an "InvalidCredentials" error if user does not exist', async () => {
      const result = await sut.execute({
        email: 'john@doe.com' as Email,
        password: 'dummy-password' as Password,
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'InvalidCredentials',
      });
    });

    it('fails with an "InvalidCredentials" error if passwords does no match', async () => {
      await performSetup();

      const result = await sut.execute({
        email: 'john@doe.com' as Email,
        password: '123456' as Password,
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'InvalidCredentials',
      });
    });

    it('creates a new session', async () => {
      await performSetup();

      const result = await sut.execute({
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
  });
});
