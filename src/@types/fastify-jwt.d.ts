import '@fastify/jwt';
import { type UserRole, type UserId } from '@features/users';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: UserId;
      role: UserRole;
    };
  }
}
