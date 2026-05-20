import { CourseTrack, UserLevel } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  module: {
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  moduleProgress: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  userProgress: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  userQuest: {
    findFirst: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: prismaMock,
}));

import { completeModule } from '../src/services/gamification.service.js';

describe('track completion badges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not award a track badge after only one module on the track', async () => {
    const userId = 'user-badge';
    const moduleId = 'module-badge';

    prismaMock.module.findUnique.mockResolvedValue({
      id: moduleId,
      courseId: 'course-1',
      questions: [{ id: 'q1', correctOption: 'a' }],
      game: { solution: { correctOrder: [1] } },
      course: { slug: 'apple-cert-prep', title: 'Parcours Apple', track: CourseTrack.APPLE },
    });
    prismaMock.moduleProgress.findUnique.mockResolvedValue(null);
    prismaMock.moduleProgress.upsert.mockResolvedValue({});
    prismaMock.userProgress.upsert.mockResolvedValue({
      userId,
      points: 28,
      level: UserLevel.NOVICE,
      badges: [],
    });
    prismaMock.module.count.mockResolvedValue(3);
    prismaMock.moduleProgress.count.mockResolvedValue(1);
    prismaMock.userQuest.findFirst.mockResolvedValue({
      id: 'quest-1',
      progress: 0,
      target: 2,
      completed: false,
    });
    prismaMock.userQuest.update.mockResolvedValue({});
    prismaMock.userQuest.upsert.mockResolvedValue({});
    prismaMock.userQuest.findMany.mockResolvedValue([]);
    prismaMock.moduleProgress.findMany.mockResolvedValue([{ quizScore: 100, gameScore: 100 }]);

    await completeModule(userId, moduleId, {
      quizAnswers: { q1: 'a' },
      gameOrder: [1],
    });

    expect(prismaMock.userProgress.update).toHaveBeenCalledWith({
      where: { userId },
      data: expect.objectContaining({
        badges: [],
      }),
    });
  });

  it('awards the track badge when every module on the track is completed', async () => {
    const userId = 'user-badge-full';
    const moduleId = 'module-badge-full';

    prismaMock.module.findUnique.mockResolvedValue({
      id: moduleId,
      courseId: 'course-1',
      questions: [{ id: 'q1', correctOption: 'a' }],
      game: { solution: { correctOrder: [1] } },
      course: { slug: 'apple-cert-prep', title: 'Parcours Apple', track: CourseTrack.APPLE },
    });
    prismaMock.moduleProgress.findUnique.mockResolvedValue(null);
    prismaMock.moduleProgress.upsert.mockResolvedValue({});
    prismaMock.userProgress.upsert.mockResolvedValue({
      userId,
      points: 28,
      level: UserLevel.NOVICE,
      badges: [],
    });
    prismaMock.module.count.mockResolvedValue(3);
    prismaMock.moduleProgress.count.mockResolvedValue(3);
    prismaMock.userQuest.findFirst.mockResolvedValue({
      id: 'quest-1',
      progress: 0,
      target: 2,
      completed: false,
    });
    prismaMock.userQuest.update.mockResolvedValue({});
    prismaMock.userQuest.upsert.mockResolvedValue({});
    prismaMock.userQuest.findMany.mockResolvedValue([]);
    prismaMock.moduleProgress.findMany.mockResolvedValue([
      { quizScore: 100, gameScore: 100 },
      { quizScore: 100, gameScore: 100 },
      { quizScore: 100, gameScore: 100 },
    ]);

    await completeModule(userId, moduleId, {
      quizAnswers: { q1: 'a' },
      gameOrder: [1],
    });

    expect(prismaMock.userProgress.update).toHaveBeenCalledWith({
      where: { userId },
      data: expect.objectContaining({
        badges: ['apple-mdm-foundation'],
      }),
    });
  });
});
