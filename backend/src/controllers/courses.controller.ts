import type { FastifyReply, FastifyRequest } from 'fastify';
import { CourseTrack } from '@prisma/client';
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

export async function getCourseProgress(
  req: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) {
  try {
    const data = await gamification.getCourseProgress(req.user.sub, req.params.slug);
    return reply.send(data);
  } catch (e) {
    if ((e as Error).message === 'COURSE_NOT_FOUND') {
      return reply.status(404).send({ error: 'COURSE_NOT_FOUND' });
    }
    throw e;
  }
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

export async function getUserProgress(req: FastifyRequest, reply: FastifyReply) {
  const data = await gamification.getUserProgress(req.user.sub);
  return reply.send(data);
}

export async function getWeeklyQuests(req: FastifyRequest, reply: FastifyReply) {
  const quests = await gamification.ensureWeeklyQuests(req.user.sub);
  return reply.send({ quests });
}

export async function startCertificationSprint(
  req: FastifyRequest<{ Body: { track?: CourseTrack; days?: number } }>,
  reply: FastifyReply
) {
  try {
    const track = req.body?.track;
    if (!track) return reply.status(400).send({ error: 'INVALID_SPRINT_TRACK' });

    const certificationSprint = await gamification.startCertificationSprint(req.user.sub, {
      track,
      days: req.body?.days,
    });
    return reply.status(201).send({ certificationSprint });
  } catch (e) {
    if ((e as Error).message === 'INVALID_SPRINT_TRACK' || (e as Error).message === 'INVALID_SPRINT_DAYS') {
      return reply.status(400).send({ error: (e as Error).message });
    }
    throw e;
  }
}

export async function getCurrentCertificationSprint(req: FastifyRequest, reply: FastifyReply) {
  const certificationSprint = await gamification.getCurrentCertificationSprint(req.user.sub);
  return reply.send({ certificationSprint });
}

export async function getLeaderboard(req: FastifyRequest, reply: FastifyReply) {
  const data = await gamification.getLeaderboard(req.user.sub);
  return reply.send(data);
}
