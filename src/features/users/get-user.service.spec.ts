import assert from 'assert';

import { E } from '@shared/effect';
import { UsersInMemoryRepository } from '@features/users';
import { HashedPassword, type Email } from '@shared/branded-types';

import { GetUserService } from './get-user.service';
import { type UserId } from './user.identifier';

describe('GetUserService', () => {
  let usersRepository: UsersInMemoryRepository;
  let sut: GetUserService;

  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    sut = new GetUserService(usersRepository);
  });

  describe('execute', () => {
    const performSetup = async () => {
      const user = await usersRepository.create({
        name: 'John Doe',
        email: 'john@doe.com' as Email,
        passwordHash: await HashedPassword.parseAsync('dummy-password'),
      });

      return user;
    };

    it('fails with an "ResourceNotFound" error if user does not exist', async () => {
      const result = await sut.execute({
        id: 'invalid-id' as UserId,
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchObject({
        tag: 'ResourceNotFound',
        resourceId: 'invalid-id',
      });
    });

    it('returns the user', async () => {
      const { id } = await performSetup();

      const result = await sut.execute({
        id,
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
