import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { getDatabaseHealth, healthRoutes } from '../src/routes/health.routes.js';

describe('health routes', () => {
  beforeEach(() => {
    vi.mocked(prisma.$queryRaw).mockReset();
  });

  it('reports ok when Prisma can query the database', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }] as never);

    await expect(getDatabaseHealth()).resolves.toEqual({
      status: 'ok',
      message: 'Database reachable.',
    });
  });

  it('returns a generic error without exposing database details', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('postgres://user:password@localhost:5432/app'));

    await expect(getDatabaseHealth()).resolves.toEqual({
      status: 'error',
      message: 'Database unavailable. Check Docker Desktop, DATABASE_URL, migrations and seed.',
    });
  });

  it('exposes /health with service name and version', async () => {
    const app = Fastify();
    await app.register(healthRoutes);
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      ok: true,
      service: 'apple-mdm-academy-api',
      version: '0.3.8',
    });

    await app.close();
  });

  it('exposes /health/db publicly with a 503 when the database is unavailable', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('connection failed'));
    const app = Fastify();

    await app.register(healthRoutes);
    const response = await app.inject({ method: 'GET', url: '/health/db' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: 'error',
      message: 'Database unavailable. Check Docker Desktop, DATABASE_URL, migrations and seed.',
    });

    await app.close();
  });
});
