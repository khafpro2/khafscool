import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  course: {
    findUnique: vi.fn(),
  },
  question: {
    findMany: vi.fn(),
  },
  userProgress: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  userQuest: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: prismaMock,
}));

vi.mock('../src/middleware/auth.middleware.js', () => ({
  requireAuth: async (req: { user?: { sub: string } }) => {
    req.user = { sub: 'user-demo' };
  },
}));

import { coursesRoutes } from '../src/routes/courses.routes.js';
import { signPracticeExamAttempt } from '../src/services/practice-exam.service.js';

function mockCompletedCourse() {
  const questions = Array.from({ length: 10 }, (_, index) => ({
    id: `q-${index}`,
    moduleId: 'module-1',
    type: 'MULTIPLE_CHOICE',
    prompt: `Question ${index + 1}?`,
    options: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ],
    correctOption: 'b',
    explanation: 'Parce que B',
  }));

  prismaMock.course.findUnique.mockResolvedValue({
    id: 'course-1',
    slug: 'apple-cert-prep',
    title: 'Parcours Apple',
    track: 'APPLE',
    sortOrder: 1,
    description: 'Desc',
    createdAt: new Date(),
    updatedAt: new Date(),
    modules: [
      {
        id: 'module-1',
        courseId: 'course-1',
        slug: 'module-1',
        title: 'Unité 1',
        summary: 'Résumé',
        learningObjectives: [],
        keyTakeaways: [],
        lessonContent: '',
        imageUrl: null,
        sortOrder: 1,
        questions,
      },
    ],
  } as never);

  return questions;
}

describe('POST /courses/:slug/practice-exam/score', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.userQuest.findMany.mockResolvedValue([]);
    prismaMock.userQuest.upsert.mockResolvedValue({});
  });

  it('computes score server-side and rejects forged scorePercent payloads', async () => {
    const questions = mockCompletedCourse();
    const questionIds = questions.map((question) => question.id);
    const attemptToken = signPracticeExamAttempt('user-demo', 'apple-cert-prep', questionIds);

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
    } as never);

    prismaMock.question.findMany.mockResolvedValue(
      questions.map((question) => ({ id: question.id, correctOption: question.correctOption })) as never
    );

    prismaMock.userProgress.findUnique.mockResolvedValue({
      userId: 'user-demo',
      points: 100,
      level: 'NOVICE',
      badges: [],
    });

    const app = Fastify();
    await app.register(coursesRoutes);

    const forgedResponse = await app.inject({
      method: 'POST',
      url: '/courses/apple-cert-prep/practice-exam/score',
      payload: { scorePercent: 100 },
    });
    expect(forgedResponse.statusCode).toBe(400);

    const allCorrectResponse = await app.inject({
      method: 'POST',
      url: '/courses/apple-cert-prep/practice-exam/score',
      payload: {
        attemptToken,
        answers: questions.map((question) => ({
          questionId: question.id,
          selectedOption: question.correctOption,
        })),
      },
    });

    expect(allCorrectResponse.statusCode).toBe(200);
    expect(allCorrectResponse.json()).toMatchObject({
      scorePercent: 100,
      passed: true,
      correctCount: 10,
      totalQuestions: 10,
    });

    const allWrongResponse = await app.inject({
      method: 'POST',
      url: '/courses/apple-cert-prep/practice-exam/score',
      payload: {
        attemptToken,
        answers: questions.map((question) => ({
          questionId: question.id,
          selectedOption: 'a',
        })),
      },
    });

    expect(allWrongResponse.statusCode).toBe(200);
    expect(allWrongResponse.json()).toMatchObject({
      scorePercent: 0,
      passed: false,
      correctCount: 0,
      totalQuestions: 10,
    });

    await app.close();
  });
});
