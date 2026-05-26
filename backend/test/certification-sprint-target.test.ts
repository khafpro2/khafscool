import { CourseTrack } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  module: { count: vi.fn() },
  moduleProgress: { count: vi.fn() },
  userQuest: { upsert: vi.fn(), findMany: vi.fn() },
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: prismaMock,
}));

import { startCertificationSprint } from '../src/services/gamification.service.js';

describe('certification sprint module target', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets sprint target to the number of modules on the track (4)', async () => {
    prismaMock.module.count.mockResolvedValue(4);
    prismaMock.moduleProgress.count.mockResolvedValue(1);
    prismaMock.userQuest.upsert.mockResolvedValue({
      id: 'sprint-1',
      questKey: 'sprint:APPLE:2026-05-23:7',
      label: 'Certification Sprint Apple - 7 jours',
      target: 4,
      progress: 1,
      completed: false,
      weekStart: new Date('2026-05-23T00:00:00.000Z'),
    });

    const summary = await startCertificationSprint('user-sprint', { track: CourseTrack.APPLE, days: 7 });

    expect(prismaMock.module.count).toHaveBeenCalledWith({ where: { course: { track: CourseTrack.APPLE } } });
    expect(summary?.target).toBe(4);
  });
});
