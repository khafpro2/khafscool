import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    userProgress: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import {
  awardSupporterBadge,
  isSupporterFromBadges,
  SUPPORTER_BADGE,
} from '../src/services/supporter-badge.service.js';

describe('supporter badge service', () => {
  beforeEach(() => {
    vi.mocked(prisma.userProgress.findUnique).mockReset();
    vi.mocked(prisma.userProgress.create).mockReset();
    vi.mocked(prisma.userProgress.update).mockReset();
  });

  it('detects supporter badge in badge list', () => {
    expect(isSupporterFromBadges(['apple-mdm-foundation', SUPPORTER_BADGE])).toBe(true);
    expect(isSupporterFromBadges(['apple-mdm-foundation'])).toBe(false);
    expect(isSupporterFromBadges([])).toBe(false);
  });

  it('creates progress with supporter badge when missing', async () => {
    vi.mocked(prisma.userProgress.findUnique).mockResolvedValue(null);

    await awardSupporterBadge('user-1');

    expect(prisma.userProgress.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', badges: [SUPPORTER_BADGE] },
    });
  });

  it('appends supporter badge when progress exists', async () => {
    vi.mocked(prisma.userProgress.findUnique).mockResolvedValue({
      badges: ['apple-mdm-foundation'],
    } as never);

    await awardSupporterBadge('user-2');

    expect(prisma.userProgress.update).toHaveBeenCalledWith({
      where: { userId: 'user-2' },
      data: { badges: ['apple-mdm-foundation', SUPPORTER_BADGE] },
    });
  });

  it('skips update when supporter badge already present', async () => {
    vi.mocked(prisma.userProgress.findUnique).mockResolvedValue({
      badges: [SUPPORTER_BADGE],
    } as never);

    await awardSupporterBadge('user-3');

    expect(prisma.userProgress.update).not.toHaveBeenCalled();
    expect(prisma.userProgress.create).not.toHaveBeenCalled();
  });
});
