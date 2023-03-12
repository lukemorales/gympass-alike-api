/* eslint-disable consistent-return */
import { type FastifyReply, type FastifyRequest } from 'fastify';

export async function sessionsMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401);
  }
}
