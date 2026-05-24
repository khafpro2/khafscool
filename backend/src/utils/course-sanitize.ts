import type { Game, Module, Question } from '@prisma/client';
import { moduleQuizQuestions } from '@ama/shared/quiz-content';

type QuestionOption = { id: string; label: string };

function normalizeOptions(options: unknown): QuestionOption[] {
  if (!Array.isArray(options)) return [];
  return options.map((option) => {
    if (typeof option === 'string') return { id: option, label: option };
    const record = option as { id?: string; label?: string };
    return { id: record.id ?? '', label: record.label ?? '' };
  });
}

export function sanitizeQuestion(question: Question) {
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    options: normalizeOptions(question.options),
  };
}

export function sanitizeGame(game: Game | null | undefined) {
  if (!game) return null;
  const steps = Array.isArray(game.steps) ? game.steps : [];
  return {
    id: game.id,
    type: game.type,
    scenario: game.scenario,
    steps,
  };
}

export function sanitizeModule(module: Module & { questions: Question[]; game: Game | null }) {
  return {
    id: module.id,
    slug: module.slug,
    title: module.title,
    summary: module.summary,
    learningObjectives: module.learningObjectives ?? [],
    keyTakeaways: module.keyTakeaways ?? [],
    lessonContent: module.lessonContent ?? '',
    imageUrl: module.imageUrl,
    videoUrl: module.videoUrl,
    videoTitle: module.videoTitle,
    videoDurationMinutes: module.videoDurationMinutes,
    sortOrder: module.sortOrder,
    questions: moduleQuizQuestions(module.questions).map(sanitizeQuestion),
    game: sanitizeGame(module.game),
  };
}

export function sanitizeCourse(
  course: {
    id: string;
    slug: string;
    track: string;
    title: string;
    description: string;
    sortOrder: number;
    modules: (Module & { questions: Question[]; game: Game | null })[];
  }
) {
  return {
    id: course.id,
    slug: course.slug,
    track: course.track,
    title: course.title,
    description: course.description,
    sortOrder: course.sortOrder,
    modules: course.modules.map(sanitizeModule),
  };
}
