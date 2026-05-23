import { pickPracticeExamQuestions, PRACTICE_EXAM_QUESTION_COUNT } from '@ama/shared/practice-exam';
import { getCourseQuestionCount } from '@ama/shared/constants';
import type { CourseSlug } from '@ama/shared/learning-paths';
import { prisma } from '../lib/prisma.js';
import { sanitizeQuestion } from '../utils/course-sanitize.js';

export async function getPracticeExam(slug: string) {
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

  return {
    course: {
      slug: course.slug,
      title: course.title,
      track: course.track,
    },
    questionCount: questions.length,
    poolSize: pool.length,
    expectedPoolSize: getCourseQuestionCount(course.slug as CourseSlug),
    questions,
  };
}
