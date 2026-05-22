import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { rotateRefreshToken, revokeAllUserRefreshTokens } from '../src/services/token.service.js';

const refreshToken = prisma.refreshToken;

describe('rotateRefreshToken', () => {
  beforeEach(() => {
    vi.mocked(refreshToken.create).mockReset();
    vi.mocked(refreshToken.findUnique).mockReset();
    vi.mocked(refreshToken.update).mockReset();
    vi.mocked(refreshToken.updateMany).mockReset();
  });

  it('revokes the current refresh token and creates a replacement for the same user', async () => {
    const oldPlainToken = 'old-refresh-token';
    const existing = {
      id: 'refresh-1',
      userId: 'user-1',
      tokenHash: crypto.createHash('sha256').update(oldPlainToken).digest('hex'),
      expiresAt: new Date(Date.now() + 60_000),
      revoked: false,
    };

    vi.mocked(refreshToken.findUnique).mockResolvedValue(existing as never);
    vi.mocked(refreshToken.update).mockResolvedValue({ ...existing, revoked: true } as never);
    vi.mocked(refreshToken.create).mockResolvedValue({} as never);

    const rotated = await rotateRefreshToken(oldPlainToken);

    expect(refreshToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: existing.tokenHash },
    });
    expect(refreshToken.update).toHaveBeenCalledWith({
      where: { id: existing.id },
      data: { revoked: true },
    });
    expect(refreshToken.create).toHaveBeenCalledWith({
      data: {
        userId: existing.userId,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(Date),
      },
    });
    expect(rotated).toEqual({
      userId: existing.userId,
      plainToken: expect.stringMatching(/^[a-f0-9]{96}$/),
      expiresAt: expect.any(Date),
    });
  });

  it('rejects an unknown refresh token before revoking or issuing a new one', async () => {
    vi.mocked(refreshToken.findUnique).mockResolvedValue(null);

    await expect(rotateRefreshToken('missing-refresh-token')).rejects.toThrow('INVALID_REFRESH');

    expect(refreshToken.update).not.toHaveBeenCalled();
    expect(refreshToken.create).not.toHaveBeenCalled();
  });
});

describe('revokeAllUserRefreshTokens', () => {
  beforeEach(() => {
    vi.mocked(refreshToken.updateMany).mockReset();
  });

  it('revokes all active refresh tokens for a user', async () => {
    vi.mocked(refreshToken.updateMany).mockResolvedValue({ count: 4 });

    const revokedCount = await revokeAllUserRefreshTokens('user-1');

    expect(refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revoked: false },
      data: { revoked: true },
    });
    expect(revokedCount).toBe(4);
  });
});
