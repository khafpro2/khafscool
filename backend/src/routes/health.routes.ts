import type { FastifyInstance } from 'fastify';
import { getDatabaseHealth, type DatabaseHealthResponse } from '../lib/database-health.js';

export type { DatabaseHealthResponse };
export { getDatabaseHealth, isSchemaMissing, schemaMissingMessage } from '../lib/database-health.js';

const API_VERSION = '0.3.15';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    ok: true,
    service: 'apple-mdm-academy-api',
    version: API_VERSION,
  }));

  app.get('/health/db', async (_req, reply) => {
    const health = await getDatabaseHealth();

    if (health.status === 'error') {
      return reply.status(503).send(health);
    }

    return reply.send(health);
  });
}
