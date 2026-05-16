import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma.js';
import * as gamification from '../services/gamification.service.js';

export async function listCourses(_req: FastifyRequest, reply: FastifyReply) {
  const courses = await prisma.course.findMany({ orderBy: { sortOrder: 'asc' } });
  return reply.send({ courses });
}

export async function getCourse(
  req: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) {
  const course = await prisma.course.findUnique({
    where: { slug: req.params.slug },
    include: {
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: { questions: true, game: true },
      },
    },
  });
  if (!course) return reply.status(404).send({ error: 'NOT_FOUND' });
  return reply.send({ course });
}

export async function completeModule(
  req: FastifyRequest<{
    Params: { id: string };
    Body: { quizAnswers?: Record<string, string>; gameOrder?: number[] };
  }>,
  reply: FastifyReply
) {
  try {
    const result = await gamification.completeModule(req.user.sub, req.params.id, req.body ?? {});
    return reply.send(result);
  } catch (e) {
    if ((e as Error).message === 'MODULE_NOT_FOUND') {
      return reply.status(404).send({ error: 'MODULE_NOT_FOUND' });
    }
    throw e;
  }
}

export async function getDashboard(req: FastifyRequest, reply: FastifyReply) {
  const data = await gamification.getDashboard(req.user.sub);
  return reply.send(data);
}
