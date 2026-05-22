import Fastify from 'fastify';
import { AuthProvider } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { updateCurrentUserProfile } from '../src/controllers/auth.controller.js';
import { coursesRoutes } from '../src/routes/courses.routes.js';
import { updateProfileSchema } from '../src/schemas/auth.schemas.js';
import { signAccessToken } from '../src/services/token.service.js';

describe('updateProfileSchema', () => {
  it('rejects empty display names with a French message', () => {
    const result = updateProfileSchema.safeParse({ displayName: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('requis'))).toBe(true);
    }
  });

  it('accepts trimmed display names up to 100 characters', () => {
    expect(updateProfileSchema.safeParse({ displayName: '  Camille MDM  ' }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ displayName: 'a'.repeat(101) }).success).toBe(false);
  });
});

describe('PATCH /users/me', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.update).mockReset();
  });

  it('returns INVALID_PROFILE_REQUEST for invalid payloads', async () => {
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    const req = { user: { sub: 'user-1' }, body: { displayName: '' } };

    await updateCurrentUserProfile(req as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INVALID_PROFILE_REQUEST' })
    );
  });

  it('updates displayName for the authenticated user', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-1',
      email: 'camille@example.com',
      displayName: 'Camille MDM',
      provider: AuthProvider.LOCAL,
    } as never);

    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const req = { user: { sub: 'user-1' }, body: { displayName: '  Camille MDM  ' } };

    await updateCurrentUserProfile(req as never, reply as never);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { displayName: 'Camille MDM' },
    });
    expect(reply.send).toHaveBeenCalledWith({
      user: {
        id: 'user-1',
        email: 'camille@example.com',
        displayName: 'Camille MDM',
        provider: AuthProvider.LOCAL,
      },
    });
  });

  it('requires authentication on the route', async () => {
    const app = Fastify();
    await app.register(coursesRoutes);

    const unauthenticated = await app.inject({
      method: 'PATCH',
      url: '/users/me',
      payload: { displayName: 'Test' },
    });
    expect(unauthenticated.statusCode).toBe(401);

    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-1',
      email: 'camille@example.com',
      displayName: 'Camille MDM',
      provider: AuthProvider.LOCAL,
    } as never);

    const token = signAccessToken({ sub: 'user-1', email: 'camille@example.com' });
    const authenticated = await app.inject({
      method: 'PATCH',
      url: '/users/me',
      headers: { authorization: `Bearer ${token}` },
      payload: { displayName: 'Camille MDM' },
    });

    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.json()).toEqual({
      user: {
        id: 'user-1',
        email: 'camille@example.com',
        displayName: 'Camille MDM',
        provider: AuthProvider.LOCAL,
      },
    });

    await app.close();
  });
});
