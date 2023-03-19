/* eslint-disable consistent-return */
import { type FastifyReply, type FastifyRequest } from 'fastify';

import { type UserRole } from '@features/users';

export function verifyUserRoleMiddleware(requiredRoles: UserRole[]) {
  return async function middleware(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    if (!requiredRoles.includes(request.user.role)) {
      return reply.status(403);
    }
  };
}
