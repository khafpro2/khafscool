import { getPracticeExamPoolSize } from '@ama/shared/constants';
import type { CourseSlug } from '@ama/shared/learning-paths';
import { getSeedQuestionsForCourse } from '@ama/shared/quiz-content';
import { pickPracticeExamQuestions } from '@ama/shared/practice-exam';
import type { CourseDetail, PracticeExamData } from './types';

export function buildDemoPracticeExam(course: CourseDetail): PracticeExamData {
  const seedPool = getSeedQuestionsForCourse(course.slug as CourseSlug).map((question, index) => ({
    id: `demo-practice-${course.slug}-q${index + 1}`,
    type: question.type,
    prompt: question.prompt,
    options: question.options,
    moduleId: course.modules[0]?.id ?? 'demo-module',
    correctOption: question.correctOption,
    explanation: question.explanation,
  }));

  const pool =
    seedPool.length > 0
      ? seedPool
      : course.modules.flatMap((module) =>
          module.questions.map((question) => ({
            id: question.id,
            type: question.type,
            prompt: question.prompt,
            options: question.options,
            moduleId: module.id,
            correctOption: question.correctOption,
            explanation: question.explanation,
          }))
        );

  const questions = pickPracticeExamQuestions(pool);

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
  };
}
