import { getCourseQuestionCount } from '@ama/shared/constants';
import type { CourseSlug } from '@ama/shared/learning-paths';
import { pickPracticeExamQuestions } from '@ama/shared/practice-exam';
import type { CourseDetail, PracticeExamData } from './types';

export function buildDemoPracticeExam(course: CourseDetail): PracticeExamData {
  const pool = course.modules.flatMap((module) =>
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
    expectedPoolSize: getCourseQuestionCount(course.slug as CourseSlug),
    questions,
  };
}
