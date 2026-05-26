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
    updateMany: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: prismaMock,
}));

import {
  completeModule,
  isTrackFullyCompleted,
} from '../src/services/gamification.service.js';

function mockModuleCompletion(userId: string, moduleId: string) {
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
  prismaMock.userProgress.update.mockResolvedValue({});
  prismaMock.moduleProgress.count.mockResolvedValue(1);
  prismaMock.userQuest.findMany.mockResolvedValue([]);
  prismaMock.moduleProgress.findMany.mockResolvedValue([{ quizScore: 100, gameScore: 100 }]);
  prismaMock.module.count.mockResolvedValue(4);
}

describe('weekly quest rewards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('credits reward points once when a weekly quest reaches its target', async () => {
    const userId = 'user-quest';
    const moduleId = 'module-quest';

    mockModuleCompletion(userId, moduleId);

    prismaMock.userQuest.findFirst.mockImplementation(({ where }: { where: { questKey: string } }) => {
      if (where.questKey === 'weekly-apple-2') {
        return Promise.resolve({
          id: 'quest-weekly',
          progress: 1,
          target: 2,
          completed: false,
          rewardClaimed: false,
        });
      }
      if (where.questKey === 'weekly-mdm-4') {
        return Promise.resolve({
          id: 'quest-mdm',
          progress: 0,
          target: 4,
          completed: false,
          rewardClaimed: false,
        });
      }
      return Promise.resolve(null);
    });

    prismaMock.userQuest.update.mockResolvedValue({});
    prismaMock.userQuest.upsert.mockResolvedValue({});
    prismaMock.userQuest.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.userProgress.upsert
      .mockResolvedValueOnce({
        userId,
        points: 28,
        level: UserLevel.NOVICE,
        badges: [],
      })
      .mockResolvedValueOnce({
        userId,
        points: 68,
        level: UserLevel.NOVICE,
        badges: [],
      });

    await completeModule(userId, moduleId, {
      quizAnswers: { q1: 'a' },
      gameOrder: [1],
    });

    expect(prismaMock.userQuest.update).toHaveBeenCalledWith({
      where: { id: 'quest-weekly' },
      data: { progress: 2, completed: true },
    });
    expect(prismaMock.userQuest.updateMany).toHaveBeenCalledWith({
      where: { id: 'quest-weekly', rewardClaimed: false },
      data: { rewardClaimed: true },
    });
    expect(prismaMock.userProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
        update: { points: { increment: 40 } },
      })
    );
  });

  it('does not credit reward points again when the quest is already completed', async () => {
    const userId = 'user-quest-done';
    const moduleId = 'module-quest-done';

    mockModuleCompletion(userId, moduleId);

    prismaMock.userQuest.findFirst.mockResolvedValue({
      id: 'quest-weekly',
      progress: 2,
      target: 2,
      completed: true,
      rewardClaimed: true,
    });
    prismaMock.userQuest.upsert.mockResolvedValue({});

    await completeModule(userId, moduleId, {
      quizAnswers: { q1: 'a' },
      gameOrder: [1],
    });

    expect(prismaMock.userQuest.update).not.toHaveBeenCalled();
    expect(prismaMock.userQuest.updateMany).not.toHaveBeenCalled();
  });
});

describe('isTrackFullyCompleted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires every module on the track to be completed', async () => {
    prismaMock.module.count.mockResolvedValue(4);
    prismaMock.moduleProgress.count.mockResolvedValue(3);
    await expect(isTrackFullyCompleted('user-1', CourseTrack.APPLE)).resolves.toBe(false);

    prismaMock.moduleProgress.count.mockResolvedValue(4);
    await expect(isTrackFullyCompleted('user-1', CourseTrack.APPLE)).resolves.toBe(true);
  });
});
