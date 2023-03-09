import assert from 'assert';
import bcrypt from 'bcryptjs';

import { E } from '@shared/effect';
import {
  ENCRYPTION_SALT_ROUNDS,
  UsersInMemoryRepository,
} from '@features/users';

import { GetUserService } from './get-user.service';

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
        email: 'john@doe.com',
        passwordHash: await bcrypt.hash(
          'dummy-password',
          ENCRYPTION_SALT_ROUNDS,
        ),
      });

      return user;
    };

    it('fails with an "ResourceNotFound" error if user does not exist', async () => {
      const result = await sut.execute({
        id: 'invalid-id',
      });

      assert.ok(E.isLeft(result));

      expect(result.left).toMatchInlineSnapshot(`
        ResourceNotFound {
          "resourceId": "invalid-id",
          "tag": "ResourceNotFound",
        }
      `);
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
        password_hash: expect.any(String),
      });
    });
  });
});
