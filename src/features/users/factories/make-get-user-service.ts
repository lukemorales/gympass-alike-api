import { GetUserService } from '../get-user.service';
import { UsersPrismaRepository } from '../repositories';

export function makeGetUserService() {
  const usersRepository = new UsersPrismaRepository();

  return new GetUserService(usersRepository);
}
