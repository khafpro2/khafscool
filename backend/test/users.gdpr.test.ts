import Fastify from 'fastify';
import { AuthProvider } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { deleteCurrentUser, exportCurrentUserData } from '../src/controllers/auth.controller.js';
import { coursesRoutes } from '../src/routes/courses.routes.js';
import { deleteAccountSchema } from '../src/schemas/auth.schemas.js';
import { signAccessToken } from '../src/services/token.service.js';

describe('deleteAccountSchema', () => {
  it('requires the exact confirmation token SUPPRIMER', () => {
    expect(deleteAccountSchema.safeParse({ confirm: 'SUPPRIMER' }).success).toBe(true);
    expect(deleteAccountSchema.safeParse({ confirm: 'supprimer' }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({}).success).toBe(false);
  });
});

describe('GET /users/me/export', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
  });

  it('returns profile, progress, badges and points without password hash', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'camille@example.com',
      passwordHash: 'secret-hash',
      displayName: 'Camille',
      avatarUrl: null,
      provider: AuthProvider.LOCAL,
      externalId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      progress: { userId: 'user-1', points: 120, level: 'NOVICE', badges: ['apple-mdm-foundation'] },
      moduleProgress: [
        {
          id: 'mp-1',
          userId: 'user-1',
          moduleId: 'mod-1',
          quizScore: 80,
          gameScore: 100,
          completedAt: new Date('2026-01-02T00:00:00.000Z'),
          module: {
            slug: 'module-1',
            title: 'Unité 1',
            course: { slug: 'apple-cert-prep', title: 'Apple', track: 'APPLE' },
          },
        },
      ],
      quests: [],
      subscription: null,
    } as never);

    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    await exportCurrentUserData({ user: { sub: 'user-1' } } as never, reply as never);

    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({
          id: 'user-1',
          email: 'camille@example.com',
          displayName: 'Camille',
        }),
        progress: { points: 120, level: 'NOVICE', badges: ['apple-mdm-foundation'] },
        moduleProgress: [
          expect.objectContaining({
            moduleSlug: 'module-1',
            quizScore: 80,
            gameScore: 100,
          }),
        ],
      })
    );

    const payload = vi.mocked(reply.send).mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('passwordHash');
  });

  it('requires authentication on the route', async () => {
    const app = Fastify();
    await app.register(coursesRoutes);

    const unauthenticated = await app.inject({ method: 'GET', url: '/users/me/export' });
    expect(unauthenticated.statusCode).toBe(401);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'camille@example.com',
      passwordHash: null,
      displayName: 'Camille',
      avatarUrl: null,
      provider: AuthProvider.LOCAL,
      externalId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: { userId: 'user-1', points: 0, level: 'NOVICE', badges: [] },
      moduleProgress: [],
      quests: [],
      subscription: null,
    } as never);

    const token = signAccessToken({ sub: 'user-1', email: 'camille@example.com' });
    const authenticated = await app.inject({
      method: 'GET',
      url: '/users/me/export',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.json()).toMatchObject({
      profile: { id: 'user-1', email: 'camille@example.com' },
      progress: { points: 0, badges: [] },
    });

    await app.close();
  });
});

describe('DELETE /users/me', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.user.delete).mockReset();
  });

  it('returns INVALID_DELETE_REQUEST when confirmation is missing', async () => {
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    await deleteCurrentUser({ user: { sub: 'user-1' }, body: { confirm: 'NON' } } as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INVALID_DELETE_REQUEST' })
    );
  });

  it('deletes the authenticated user when confirmation matches', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(prisma.user.delete).mockResolvedValue({ id: 'user-1' } as never);

    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    await deleteCurrentUser(
      { user: { sub: 'user-1' }, body: { confirm: 'SUPPRIMER' } } as never,
      reply as never
    );

    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    expect(reply.send).toHaveBeenCalledWith({ ok: true });
  });

  it('requires authentication on the route', async () => {
    const app = Fastify();
    await app.register(coursesRoutes);

    const unauthenticated = await app.inject({
      method: 'DELETE',
      url: '/users/me',
      payload: { confirm: 'SUPPRIMER' },
    });
    expect(unauthenticated.statusCode).toBe(401);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(prisma.user.delete).mockResolvedValue({ id: 'user-1' } as never);

    const token = signAccessToken({ sub: 'user-1', email: 'camille@example.com' });
    const authenticated = await app.inject({
      method: 'DELETE',
      url: '/users/me',
      headers: { authorization: `Bearer ${token}` },
      payload: { confirm: 'SUPPRIMER' },
    });

    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.json()).toEqual({ ok: true });

    await app.close();
  });
});
