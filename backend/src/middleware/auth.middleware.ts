import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../services/token.service.js';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'UNAUTHORIZED' });
  }
  try {
    request.user = verifyAccessToken(header.slice(7));
  } catch {
    return reply.status(401).send({ error: 'INVALID_TOKEN' });
  }
}
