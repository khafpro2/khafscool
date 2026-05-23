import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    course: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../src/middleware/auth.middleware.js', () => ({
  requireAuth: async (req: { user?: { sub: string } }) => {
    req.user = { sub: 'user-demo' };
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { coursesRoutes } from '../src/routes/courses.routes.js';

describe('GET /courses/:slug/practice-exam', () => {
  beforeEach(() => {
    vi.mocked(prisma.course.findUnique).mockReset();
  });

  it('returns 10 sanitized questions with moduleId', async () => {
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

    vi.mocked(prisma.course.findUnique).mockResolvedValue({
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
        {
          id: 'module-2',
          courseId: 'course-1',
          slug: 'module-2',
          title: 'Unité 2',
          summary: 'Résumé',
          learningObjectives: [],
          keyTakeaways: [],
          lessonContent: '',
          imageUrl: null,
          sortOrder: 2,
          questions: questions.map((question, index) => ({
            ...question,
            id: `q2-${index}`,
          })),
        },
        {
          id: 'module-3',
          courseId: 'course-1',
          slug: 'module-3',
          title: 'Unité 3',
          summary: 'Résumé',
          learningObjectives: [],
          keyTakeaways: [],
          lessonContent: '',
          imageUrl: null,
          sortOrder: 3,
          questions: questions.map((question, index) => ({
            ...question,
            id: `q3-${index}`,
          })),
        },
        {
          id: 'module-4',
          courseId: 'course-1',
          slug: 'module-4',
          title: 'Unité 4',
          summary: 'Résumé',
          learningObjectives: [],
          keyTakeaways: [],
          lessonContent: '',
          imageUrl: null,
          sortOrder: 4,
          questions: questions.map((question, index) => ({
            ...question,
            id: `q4-${index}`,
          })),
        },
      ],
    } as never);

    const app = Fastify();
    await app.register(coursesRoutes);

    const response = await app.inject({
      method: 'GET',
      url: '/courses/apple-cert-prep/practice-exam',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.course.slug).toBe('apple-cert-prep');
    expect(body.questionCount).toBe(10);
    expect(body.poolSize).toBe(40);
    expect(body.questions).toHaveLength(10);
    for (const question of body.questions) {
      expect(question.moduleId).toBeTruthy();
      expect(question).not.toHaveProperty('correctOption');
      expect(question).not.toHaveProperty('explanation');
    }

    await app.close();
  });

  it('returns 404 when course is missing', async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

    const app = Fastify();
    await app.register(coursesRoutes);

    const response = await app.inject({
      method: 'GET',
      url: '/courses/unknown/practice-exam',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'COURSE_NOT_FOUND' });

    await app.close();
  });
});
