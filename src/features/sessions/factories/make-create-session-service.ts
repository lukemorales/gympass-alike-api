import { UsersPrismaRepository } from '@features/users';

import { CreateSessionService } from '../create-session.service';

export function makeCreateSessionService() {
  const usersRepository = new UsersPrismaRepository();

  return new CreateSessionService(usersRepository);
}
