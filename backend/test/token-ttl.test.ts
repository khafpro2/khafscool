import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    refreshToken: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import {
  createRefreshToken,
  REFRESH_TTL_DAYS_REMEMBER,
  REFRESH_TTL_DAYS_SESSION,
} from '../src/services/token.service.js';

const refreshToken = prisma.refreshToken;

function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

describe('createRefreshToken TTL', () => {
  beforeEach(() => {
    vi.mocked(refreshToken.create).mockReset();
  });

  it('uses a longer expiry when rememberMe is true', async () => {
    const before = new Date();
    await createRefreshToken('user-1', { rememberMe: true });

    const call = vi.mocked(refreshToken.create).mock.calls[0]?.[0];
    const expiresAt = call?.data.expiresAt as Date;
    expect(daysBetween(before, expiresAt)).toBe(REFRESH_TTL_DAYS_REMEMBER);
  });

  it('uses a shorter expiry when rememberMe is false', async () => {
    const before = new Date();
    await createRefreshToken('user-1', { rememberMe: false });

    const call = vi.mocked(refreshToken.create).mock.calls[0]?.[0];
    const expiresAt = call?.data.expiresAt as Date;
    expect(daysBetween(before, expiresAt)).toBe(REFRESH_TTL_DAYS_SESSION);
  });

  it('stores a hashed refresh token', async () => {
    const created = await createRefreshToken('user-1', { rememberMe: true });
    const call = vi.mocked(refreshToken.create).mock.calls[0]?.[0];
    const storedHash = call?.data.tokenHash as string;
    const expected = crypto.createHash('sha256').update(created.plainToken).digest('hex');
    expect(storedHash).toBe(expected);
  });
});
