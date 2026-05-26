import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../services/token.service.js';

export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return;
  }

  try {
    request.user = verifyAccessToken(header.slice(7));
  } catch {
    // Session invalide : on traite la demande comme anonyme pour les dons.
  }
}
