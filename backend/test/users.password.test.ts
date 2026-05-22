import bcrypt from 'bcrypt';
import Fastify from 'fastify';
import { AuthProvider } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      updateMany: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import {
  changeCurrentUserPassword,
  logoutAllSessions,
} from '../src/controllers/auth.controller.js';
import { authRoutes } from '../src/routes/auth.routes.js';
import { coursesRoutes } from '../src/routes/courses.routes.js';
import { changePasswordSchema } from '../src/schemas/auth.schemas.js';
import { signAccessToken } from '../src/services/token.service.js';

describe('changePasswordSchema', () => {
  it('rejects short new passwords with a French message', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-secret',
      newPassword: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('8 caractères'))).toBe(true);
    }
  });

  it('accepts valid password change payloads', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'old-secret',
        newPassword: 'new-secret',
      }).success
    ).toBe(true);
  });
});

describe('PATCH /users/me/password', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.user.update).mockReset();
  });

  it('returns INVALID_PASSWORD_REQUEST for invalid payloads', async () => {
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const req = { user: { sub: 'user-1' }, body: { currentPassword: '', newPassword: 'x' } };

    await changeCurrentUserPassword(req as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INVALID_PASSWORD_REQUEST' })
    );
  });

  it('rejects OAuth accounts without a local password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      provider: AuthProvider.GOOGLE,
      passwordHash: null,
    } as never);

    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const req = {
      user: { sub: 'user-1' },
      body: { currentPassword: 'old-secret', newPassword: 'new-secret' },
    };

    await changeCurrentUserPassword(req as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'PASSWORD_NOT_AVAILABLE' })
    );
  });

  it('returns WRONG_CURRENT_PASSWORD when the current password does not match', async () => {
    const passwordHash = await bcrypt.hash('correct-secret', 4);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      provider: AuthProvider.LOCAL,
      passwordHash,
    } as never);

    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const req = {
      user: { sub: 'user-1' },
      body: { currentPassword: 'wrong-secret', newPassword: 'new-secret' },
    };

    await changeCurrentUserPassword(req as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'WRONG_CURRENT_PASSWORD' })
    );
  });

  it('updates the password hash for local accounts', async () => {
    const passwordHash = await bcrypt.hash('old-secret', 4);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      provider: AuthProvider.LOCAL,
      passwordHash,
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const reply = { send: vi.fn(), status: vi.fn().mockReturnThis() };
    const req = {
      user: { sub: 'user-1' },
      body: { currentPassword: 'old-secret', newPassword: 'new-secret-12' },
    };

    await changeCurrentUserPassword(req as never, reply as never);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: expect.any(String) },
    });
    expect(reply.send).toHaveBeenCalledWith({ ok: true });
  });

  it('requires authentication on the route', async () => {
    const app = Fastify();
    await app.register(coursesRoutes);

    const unauthenticated = await app.inject({
      method: 'PATCH',
      url: '/users/me/password',
      payload: { currentPassword: 'old', newPassword: 'new-secret' },
    });
    expect(unauthenticated.statusCode).toBe(401);

    const passwordHash = await bcrypt.hash('old-secret', 4);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      provider: AuthProvider.LOCAL,
      passwordHash,
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const token = signAccessToken({ sub: 'user-1', email: 'camille@example.com' });
    const authenticated = await app.inject({
      method: 'PATCH',
      url: '/users/me/password',
      headers: { authorization: `Bearer ${token}` },
      payload: { currentPassword: 'old-secret', newPassword: 'new-secret-12' },
    });

    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.json()).toEqual({ ok: true });

    await app.close();
  });
});

describe('POST /auth/logout-all', () => {
  beforeEach(() => {
    vi.mocked(prisma.refreshToken.updateMany).mockReset();
  });

  it('revokes all refresh tokens for the authenticated user', async () => {
    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 3 });

    const reply = { send: vi.fn() };
    const req = { user: { sub: 'user-1' } };

    await logoutAllSessions(req as never, reply as never);

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revoked: false },
      data: { revoked: true },
    });
    expect(reply.send).toHaveBeenCalledWith({ ok: true, revokedCount: 3 });
  });

  it('requires authentication on the route', async () => {
    const app = Fastify();
    await app.register(authRoutes);

    const unauthenticated = await app.inject({
      method: 'POST',
      url: '/auth/logout-all',
    });
    expect(unauthenticated.statusCode).toBe(401);

    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 2 });
    const token = signAccessToken({ sub: 'user-1', email: 'camille@example.com' });
    const authenticated = await app.inject({
      method: 'POST',
      url: '/auth/logout-all',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.json()).toEqual({ ok: true, revokedCount: 2 });

    await app.close();
  });
});
