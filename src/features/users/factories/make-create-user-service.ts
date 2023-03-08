import { CreateUserService } from '../create-user.service';
import { UsersPrismaRepository } from '../repositories';

export function makeCreateUserService() {
  const usersRepository = new UsersPrismaRepository();

  return new CreateUserService(usersRepository);
}
