import { UserLevel } from '@prisma/client';
import { PRACTICE_EXAM_PASS_BADGE, PRACTICE_EXAM_PASS_PERCENT } from '@ama/shared/practice-exam';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  course: {
    findUnique: vi.fn(),
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
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: prismaMock,
}));

import {
  isPracticeExamPassingScore,
  recordPracticeExamResult,
  WEEKLY_PRACTICE_EXAM_QUEST_KEY,
} from '../src/services/gamification.service.js';

function mockCompletedCourse() {
  prismaMock.course.findUnique.mockResolvedValue({
    id: 'course-1',
    slug: 'apple-cert-prep',
    title: 'Parcours Apple',
    description: 'Desc',
    track: 'APPLE',
    modules: Array.from({ length: 4 }, (_, index) => ({
      id: `module-${index + 1}`,
      slug: `module-${index + 1}`,
      title: `Unité ${index + 1}`,
      summary: 'Résumé',
      sortOrder: index + 1,
      progresses: [{ completedAt: new Date(), quizScore: 90, gameScore: 90 }],
    })),
  });
}

describe('practice exam gamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.userQuest.findMany.mockResolvedValue([]);
    prismaMock.userQuest.upsert.mockResolvedValue({});
  });

  it('treats scores at or above the pass threshold as passing', () => {
    expect(isPracticeExamPassingScore(PRACTICE_EXAM_PASS_PERCENT)).toBe(true);
    expect(isPracticeExamPassingScore(PRACTICE_EXAM_PASS_PERCENT - 1)).toBe(false);
  });

  it('awards practice-exam-pass badge once and completes weekly quest on pass', async () => {
    const userId = 'user-exam';
    mockCompletedCourse();

    const questState = {
      id: 'quest-practice',
      questKey: WEEKLY_PRACTICE_EXAM_QUEST_KEY,
      progress: 0,
      target: 1,
      completed: false,
      rewardClaimed: false,
    };

    prismaMock.userProgress.findUnique
      .mockResolvedValueOnce({ userId, points: 100, level: UserLevel.NOVICE, badges: [] })
      .mockResolvedValueOnce({ userId, points: 125, level: UserLevel.NOVICE, badges: [PRACTICE_EXAM_PASS_BADGE] });
    prismaMock.userProgress.upsert.mockResolvedValue({});
    prismaMock.userQuest.findFirst.mockImplementation(({ where }: { where: { questKey?: string; id?: string } }) => {
      if (where.id === questState.id || where.questKey === WEEKLY_PRACTICE_EXAM_QUEST_KEY) {
        return Promise.resolve({ ...questState });
      }
      return Promise.resolve(null);
    });
    prismaMock.userQuest.update.mockImplementation(({ data }: { data: { progress?: number; completed?: boolean } }) => {
      if (typeof data.progress === 'number') questState.progress = data.progress;
      if (typeof data.completed === 'boolean') questState.completed = data.completed;
      return Promise.resolve({});
    });
    prismaMock.userQuest.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.userProgress.upsert.mockResolvedValueOnce({}).mockResolvedValueOnce({
      userId,
      points: 125,
      level: UserLevel.NOVICE,
      badges: [],
    });

    const result = await recordPracticeExamResult(userId, 'apple-cert-prep', 80);

    expect(result.passed).toBe(true);
    expect(result.badgeEarned).toBe(PRACTICE_EXAM_PASS_BADGE);
    expect(result.questCompleted).toBe(true);
    expect(result.badges).toContain(PRACTICE_EXAM_PASS_BADGE);
    expect(prismaMock.userProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
        update: { badges: [PRACTICE_EXAM_PASS_BADGE] },
      })
    );
    expect(prismaMock.userQuest.update).toHaveBeenCalledWith({
      where: { id: 'quest-practice' },
      data: { progress: 1, completed: true },
    });
  });

  it('does not re-award badge when already earned', async () => {
    const userId = 'user-exam-badge';
    mockCompletedCourse();

    prismaMock.userProgress.findUnique.mockResolvedValue({
      userId,
      points: 100,
      level: UserLevel.NOVICE,
      badges: [PRACTICE_EXAM_PASS_BADGE],
    });
    prismaMock.userQuest.findFirst.mockResolvedValue({
      id: 'quest-practice',
      questKey: WEEKLY_PRACTICE_EXAM_QUEST_KEY,
      progress: 1,
      target: 1,
      completed: true,
      rewardClaimed: true,
    });

    const result = await recordPracticeExamResult(userId, 'apple-cert-prep', 90);

    expect(result.passed).toBe(true);
    expect(result.badgeEarned).toBeUndefined();
    expect(result.questCompleted).toBe(false);
    expect(prismaMock.userProgress.upsert).not.toHaveBeenCalled();
    expect(prismaMock.userQuest.update).not.toHaveBeenCalled();
  });

  it('does not award badge or quest when score is below threshold', async () => {
    const userId = 'user-exam-fail';
    mockCompletedCourse();

    prismaMock.userProgress.findUnique.mockResolvedValue({
      userId,
      points: 50,
      level: UserLevel.NOVICE,
      badges: [],
    });

    const result = await recordPracticeExamResult(userId, 'apple-cert-prep', 60);

    expect(result.passed).toBe(false);
    expect(result.badgeEarned).toBeUndefined();
    expect(result.questCompleted).toBe(false);
    expect(prismaMock.userProgress.upsert).not.toHaveBeenCalled();
    expect(prismaMock.userQuest.update).not.toHaveBeenCalled();
  });
});
