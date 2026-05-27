import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export type DatabaseHealthResponse = {
  message: string;
  status: 'ok' | 'error';
};

function isSchemaMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  if (code === 'P2021') return true;

  const message = 'message' in error ? String((error as { message?: string }).message) : '';
  return /does not exist|relation .* does not exist|n'existe pas/i.test(message);
}

export async function getDatabaseHealth(): Promise<DatabaseHealthResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.course.findFirst({ select: { id: true } });

    return {
      status: 'ok',
      message: 'Database reachable.',
    };
  } catch (error) {
    if (isSchemaMissing(error)) {
      return {
        status: 'error',
        message:
          'Schéma absent ou incomplet. Exécuter prisma migrate deploy puis db seed (ou redéployer avec scripts/railway-start.sh).',
      };
    }

    return {
      status: 'error',
      message: 'Database unavailable. Check Docker Desktop, DATABASE_URL, migrations and seed.',
    };
  }
}

const API_VERSION = '0.3.13';

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
