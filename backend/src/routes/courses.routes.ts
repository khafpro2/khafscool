import type { FastifyInstance } from 'fastify';
import * as courses from '../controllers/courses.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export async function coursesRoutes(app: FastifyInstance) {
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
  }>('/modules/:id/complete', { preHandler: requireAuth }, courses.completeModule);
  app.get('/users/me/progress', { preHandler: requireAuth }, courses.getUserProgress);
  app.get('/users/me/dashboard', { preHandler: requireAuth }, courses.getDashboard);
  app.get('/quests/weekly', { preHandler: requireAuth }, courses.getWeeklyQuests);
  app.post<{ Body: { track?: 'APPLE' | 'JAMF' | 'INTUNE' | 'SERVICENOW'; days?: number } }>(
    '/sprints/certification/start',
    { preHandler: requireAuth },
    courses.startCertificationSprint
  );
  app.get('/sprints/certification/current', { preHandler: requireAuth }, courses.getCurrentCertificationSprint);
  app.get('/leaderboard', { preHandler: requireAuth }, courses.getLeaderboard);
}
