import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export type DatabaseHealthResponse = {
  message: string;
  status: 'ok' | 'error';
};

export async function getDatabaseHealth(): Promise<DatabaseHealthResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      message: 'Database reachable.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Database unavailable. Check Docker Desktop, DATABASE_URL, migrations and seed.',
    };
  }
}

const API_VERSION = '0.3.7';

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
