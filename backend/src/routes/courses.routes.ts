import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import * as auth from '../controllers/auth.controller.js';
import * as courses from '../controllers/courses.controller.js';
import type { CertificationSprintRequestBody } from '../controllers/courses.controller.js';
import { buildFrenchRateLimitBody, quizProgressRateLimit } from '../lib/rate-limit.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const quizRateLimitRouteConfig = {
  rateLimit: quizProgressRateLimit,
};

export async function coursesRoutes(app: FastifyInstance) {
  await app.register(rateLimit, {
    global: false,
    hook: 'preHandler',
    errorResponseBuilder: buildFrenchRateLimitBody,
  });
  app.get('/catalog', courses.listPublicCatalog);
  app.get('/courses', { preHandler: requireAuth }, courses.listCourses);
  app.get<{ Params: { slug: string } }>(
    '/courses/:slug/progress',
    { preHandler: requireAuth },
    courses.getCourseProgress
  );
  app.get<{ Params: { slug: string } }>('/courses/:slug', { preHandler: requireAuth }, courses.getCourse);
  app.post<{
    Params: { id: string };
    Body: { quizAnswers?: Record<string, string>; gameOrder?: number[] };
  }>('/modules/:id/complete', { preHandler: requireAuth, config: quizRateLimitRouteConfig }, courses.completeModule);
  app.post<{
    Params: { id: string };
    Body: { questionId: string; selectedOption: string };
  }>('/modules/:id/check-answer', { preHandler: requireAuth, config: quizRateLimitRouteConfig }, courses.checkAnswer);
  app.get('/users/me/progress', { preHandler: requireAuth }, courses.getUserProgress);
  app.get('/users/me/dashboard', { preHandler: requireAuth }, courses.getDashboard);
  app.patch<{ Body: unknown }>('/users/me', { preHandler: requireAuth }, auth.updateCurrentUserProfile);
  app.patch<{ Body: unknown }>('/users/me/password', { preHandler: requireAuth }, auth.changeCurrentUserPassword);
  app.get('/users/me/export', { preHandler: requireAuth }, auth.exportCurrentUserData);
  app.delete<{ Body: unknown }>('/users/me', { preHandler: requireAuth }, auth.deleteCurrentUser);
  app.get('/quests/weekly', { preHandler: requireAuth }, courses.getWeeklyQuests);
  app.post<{ Body: CertificationSprintRequestBody }>(
    '/sprints/certification/start',
    { preHandler: requireAuth },
    courses.startCertificationSprint
  );
  app.get('/sprints/certification/current', { preHandler: requireAuth }, courses.getCurrentCertificationSprint);
  app.get('/leaderboard', { preHandler: requireAuth }, courses.getLeaderboard);
}
