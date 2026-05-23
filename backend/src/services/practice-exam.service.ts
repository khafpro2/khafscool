import jwt from 'jsonwebtoken';
import {
  computePracticeExamScorePercent,
  pickPracticeExamQuestions,
  PRACTICE_EXAM_QUESTION_COUNT,
} from '@ama/shared/practice-exam';
import { getPracticeExamPoolSize } from '@ama/shared/constants';
import type { CourseSlug } from '@ama/shared/learning-paths';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { sanitizeQuestion } from '../utils/course-sanitize.js';

const PRACTICE_EXAM_ATTEMPT_TTL = '2h';
const PRACTICE_EXAM_TOKEN_TYPE = 'practice_exam_attempt';

export interface PracticeExamAnswer {
  questionId: string;
  selectedOption: string;
}

export interface PracticeExamAttemptPayload {
  sub: string;
  slug: string;
  questionIds: string[];
  typ: typeof PRACTICE_EXAM_TOKEN_TYPE;
}

export function signPracticeExamAttempt(userId: string, slug: string, questionIds: string[]): string {
  const payload: PracticeExamAttemptPayload = {
    sub: userId,
    slug,
    questionIds,
    typ: PRACTICE_EXAM_TOKEN_TYPE,
  };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: PRACTICE_EXAM_ATTEMPT_TTL });
}

export function verifyPracticeExamAttempt(token: string): PracticeExamAttemptPayload {
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as PracticeExamAttemptPayload;
  if (payload.typ !== PRACTICE_EXAM_TOKEN_TYPE) {
    throw new Error('INVALID_PRACTICE_EXAM_ATTEMPT');
  }
  if (!payload.sub || !payload.slug || !Array.isArray(payload.questionIds) || payload.questionIds.length === 0) {
    throw new Error('INVALID_PRACTICE_EXAM_ATTEMPT');
  }
  return payload;
}

export function normalizePracticeExamAnswers(
  questionIds: string[],
  answers: PracticeExamAnswer[]
): Map<string, string> {
  if (answers.length !== questionIds.length) {
    throw new Error('INCOMPLETE_PRACTICE_EXAM_ANSWERS');
  }

  const expectedIds = new Set(questionIds);
  const normalized = new Map<string, string>();

  for (const answer of answers) {
    if (!expectedIds.has(answer.questionId)) {
      throw new Error('UNKNOWN_PRACTICE_EXAM_QUESTION');
    }
    if (normalized.has(answer.questionId)) {
      throw new Error('DUPLICATE_PRACTICE_EXAM_ANSWER');
    }
    normalized.set(answer.questionId, answer.selectedOption);
  }

  return normalized;
}

export async function gradePracticeExamAnswers(questionIds: string[], answers: PracticeExamAnswer[]) {
  const normalizedAnswers = normalizePracticeExamAnswers(questionIds, answers);

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, correctOption: true },
  });

  if (questions.length !== questionIds.length) {
    throw new Error('INVALID_PRACTICE_EXAM_QUESTIONS');
  }

  let correct = 0;
  for (const questionId of questionIds) {
    const question = questions.find((item) => item.id === questionId);
    if (!question) throw new Error('INVALID_PRACTICE_EXAM_QUESTIONS');
    if (question.correctOption === normalizedAnswers.get(questionId)) {
      correct += 1;
    }
  }

  return {
    correct,
    total: questionIds.length,
    scorePercent: computePracticeExamScorePercent(correct, questionIds.length),
  };
}

export async function getPracticeExam(slug: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: { questions: true },
      },
    },
  });

  if (!course) throw new Error('COURSE_NOT_FOUND');

  const pool = course.modules.flatMap((module) =>
    module.questions.map((question) => ({
      ...sanitizeQuestion(question),
      moduleId: module.id,
    }))
  );

  const questions = pickPracticeExamQuestions(pool, PRACTICE_EXAM_QUESTION_COUNT);
  const questionIds = questions.map((question) => question.id);

  return {
    course: {
      slug: course.slug,
      title: course.title,
      track: course.track,
    },
    questionCount: questions.length,
    poolSize: pool.length,
    expectedPoolSize: getPracticeExamPoolSize(course.slug as CourseSlug),
    questions,
    attemptToken: signPracticeExamAttempt(userId, slug, questionIds),
  };
}
