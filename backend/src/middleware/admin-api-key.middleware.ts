import crypto from 'crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

function readAdminApiKey() {
  return process.env.ADMIN_API_KEY?.trim() || null;
}

function timingSafeEqualString(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function requireAdminApiKey(request: FastifyRequest, reply: FastifyReply) {
  const configuredKey = readAdminApiKey();

  if (!configuredKey) {
    return reply.status(503).send({
      error: 'ADMIN_API_DISABLED',
      message: 'Les statistiques admin ne sont pas disponibles (ADMIN_API_KEY non configurée).',
    });
  }

  const headerKey = request.headers['x-admin-api-key'];
  const providedKey = typeof headerKey === 'string' ? headerKey.trim() : '';

  if (!providedKey || !timingSafeEqualString(providedKey, configuredKey)) {
    return reply.status(401).send({
      error: 'ADMIN_API_UNAUTHORIZED',
      message: 'Clé admin invalide ou absente (en-tête X-Admin-Api-Key).',
    });
  }
}
