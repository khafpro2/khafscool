import type { FastifyInstance } from 'fastify';
import * as courses from '../controllers/courses.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export async function coursesRoutes(app: FastifyInstance) {
  app.get('/courses', { preHandler: requireAuth }, courses.listCourses);
  app.get<{ Params: { slug: string } }>('/courses/:slug', { preHandler: requireAuth }, courses.getCourse);
  app.post<{ Params: { id: string } }>('/modules/:id/complete', { preHandler: requireAuth }, courses.completeModule);
  app.get('/users/me/dashboard', { preHandler: requireAuth }, courses.getDashboard);
}
