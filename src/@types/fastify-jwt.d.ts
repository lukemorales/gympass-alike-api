import '@fastify/jwt';
import { type UserId } from '@features/users';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: UserId;
    };
  }
}
