import type { FastifyReply, FastifyRequest } from 'fastify';

function readAdminApiKey() {
  return process.env.ADMIN_API_KEY?.trim() || null;
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

  if (!providedKey || providedKey !== configuredKey) {
    return reply.status(401).send({
      error: 'ADMIN_API_UNAUTHORIZED',
      message: 'Clé admin invalide ou absente (en-tête X-Admin-Api-Key).',
    });
  }
}
