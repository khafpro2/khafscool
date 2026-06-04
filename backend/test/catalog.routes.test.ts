import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    course: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { listPublicCatalog } from '../src/controllers/courses.controller.js';

describe('GET /catalog', () => {
  beforeEach(() => {
    vi.mocked(prisma.course.findMany).mockReset();
  });

  it('returns catalog with Cache-Control on success', async () => {
    vi.mocked(prisma.course.findMany).mockResolvedValue([
      {
        slug: 'apple-cert-prep',
        track: 'APPLE',
        title: 'Apple',
        description: 'Desc',
        _count: { modules: 4 },
      },
    ] as never);

    const app = Fastify();
    app.get('/catalog', listPublicCatalog);
    const response = await app.inject({ method: 'GET', url: '/catalog' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('public, max-age=300, stale-while-revalidate=60');
    const body = response.json() as { courses: { slug: string; moduleCount: number }[] };
    expect(body.courses[0]?.moduleCount).toBe(4);

    await app.close();
  });

  it('returns 503 with French hint when schema tables are missing', async () => {
    vi.mocked(prisma.course.findMany).mockRejectedValue(
      Object.assign(new Error('The table `public.Course` does not exist in the current database.'), {
        code: 'P2021',
      })
    );

    const app = Fastify();
    app.get('/catalog', listPublicCatalog);
    const response = await app.inject({ method: 'GET', url: '/catalog' });

    expect(response.statusCode).toBe(503);
    expect(response.headers['cache-control']).toBe('no-store');
    const body = response.json() as {
      error: string;
      message: string;
      courses: unknown[];
      hint?: string;
    };
    expect(body.error).toBe('SCHEMA_NOT_READY');
    expect(body.message).toContain('migrate deploy');
    expect(body.courses).toEqual([]);
    expect(body.hint).toContain('db:seed');

    await app.close();
  });
});
