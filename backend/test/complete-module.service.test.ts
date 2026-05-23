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
  question: {
    findFirst: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: prismaMock,
}));

import {
  checkQuestionAnswer,
  completeModule,
  modulePointsFromScores,
} from '../src/services/gamification.service.js';

describe('completeModule idempotence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing progress without re-awarding points on duplicate submission', async () => {
    const userId = 'user-1';
    const moduleId = 'module-1';

    prismaMock.module.findUnique.mockResolvedValue({
      id: moduleId,
      courseId: 'course-1',
      questions: [{ id: 'q1', correctOption: 'a' }],
      game: { solution: { correctOrder: [1] } },
      course: { slug: 'apple-cert-prep', title: 'Parcours Apple', track: CourseTrack.APPLE },
    });
    prismaMock.moduleProgress.findUnique.mockResolvedValue({
      userId,
      moduleId,
      quizScore: 80,
      gameScore: 100,
      completedAt: new Date('2026-05-01T10:00:00.000Z'),
    });
    prismaMock.userProgress.findUnique.mockResolvedValue({
      userId,
      points: 500,
      level: UserLevel.TECHNICIAN,
      badges: ['apple-mdm-foundation'],
    });
    prismaMock.moduleProgress.findMany.mockResolvedValue([
      { quizScore: 80, gameScore: 100 },
    ]);
    prismaMock.module.count.mockResolvedValue(4);

    const result = await completeModule(userId, moduleId, {
      quizAnswers: { q1: 'b' },
      gameOrder: [2],
    });

    expect(result).toMatchObject({
      alreadyCompleted: true,
      quizScore: 80,
      gameScore: 100,
      pointsEarned: modulePointsFromScores(80, 100),
      level: UserLevel.TECHNICIAN,
      badges: ['apple-mdm-foundation'],
    });
    expect(prismaMock.moduleProgress.upsert).not.toHaveBeenCalled();
    expect(prismaMock.userProgress.upsert).not.toHaveBeenCalled();
    expect(prismaMock.userQuest.update).not.toHaveBeenCalled();
  });

  it('grades quiz in review mode without updating progress or awarding points', async () => {
    const userId = 'user-1';
    const moduleId = 'module-1';

    prismaMock.module.findUnique.mockResolvedValue({
      id: moduleId,
      courseId: 'course-1',
      questions: [
        { id: 'q1', correctOption: 'a' },
        { id: 'q2', correctOption: 'b' },
      ],
      game: { solution: { correctOrder: [1] } },
      course: { slug: 'apple-cert-prep', title: 'Parcours Apple', track: CourseTrack.APPLE },
    });
    prismaMock.moduleProgress.findUnique.mockResolvedValue({
      userId,
      moduleId,
      quizScore: 80,
      gameScore: 100,
      completedAt: new Date('2026-05-01T10:00:00.000Z'),
    });
    prismaMock.userProgress.findUnique.mockResolvedValue({
      userId,
      points: 500,
      level: UserLevel.TECHNICIAN,
      badges: ['apple-mdm-foundation'],
    });
    prismaMock.moduleProgress.findMany.mockResolvedValue([
      { quizScore: 80, gameScore: 100 },
    ]);
    prismaMock.module.count.mockResolvedValue(4);

    const result = await completeModule(userId, moduleId, {
      quizAnswers: { q1: 'a', q2: 'b' },
      gameOrder: [1],
      reviewMode: true,
    });

    expect(result).toMatchObject({
      reviewMode: true,
      alreadyCompleted: true,
      quizScore: 100,
      pointsEarned: 0,
    });
    expect(prismaMock.moduleProgress.upsert).not.toHaveBeenCalled();
    expect(prismaMock.userProgress.upsert).not.toHaveBeenCalled();
  });

  it('awards points on first completion', async () => {
    const userId = 'user-2';
    const moduleId = 'module-2';

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
    prismaMock.userQuest.findFirst.mockResolvedValue({
      id: 'quest-1',
      progress: 0,
      target: 2,
    });
    prismaMock.userQuest.upsert.mockResolvedValue({});
    prismaMock.userQuest.update.mockResolvedValue({});
    prismaMock.userQuest.findMany.mockResolvedValue([]);
    prismaMock.moduleProgress.findMany.mockResolvedValue([{ quizScore: 100, gameScore: 100 }]);
    prismaMock.module.count.mockResolvedValue(1);

    const result = await completeModule(userId, moduleId, {
      quizAnswers: { q1: 'a' },
      gameOrder: [1],
    });

    expect(result.alreadyCompleted).toBe(false);
    expect(result.quizScore).toBe(100);
    expect(result.gameScore).toBe(100);
    expect(prismaMock.moduleProgress.upsert).toHaveBeenCalledOnce();
    expect(prismaMock.userProgress.upsert).toHaveBeenCalledOnce();
  });
});

describe('checkQuestionAnswer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correctness and explanation without exposing the correct option', async () => {
    prismaMock.module.findUnique.mockResolvedValue({ id: 'module-1' });
    prismaMock.question.findFirst.mockResolvedValue({
      id: 'q1',
      moduleId: 'module-1',
      correctOption: 'b',
      explanation: 'Parce que B',
    });

    await expect(checkQuestionAnswer('user-1', 'module-1', 'q1', 'b')).resolves.toEqual({
      correct: true,
      explanation: 'Parce que B',
    });
    await expect(checkQuestionAnswer('user-1', 'module-1', 'q1', 'a')).resolves.toEqual({
      correct: false,
      explanation: 'Parce que B',
    });
  });
});
