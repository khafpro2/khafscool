import type { CourseDetail, CourseProgressData } from '@/lib/api';

const STORAGE_PREFIX = 'ama:local-progress:';

export type LocalModuleCompletion = {
  moduleId: string;
  quizScore: number;
  gameScore: number;
  completedAt: string;
};

type LocalCourseProgressStore = {
  modules: LocalModuleCompletion[];
};

function storageKey(slug: string) {
  return `${STORAGE_PREFIX}${slug}`;
}

function readStore(slug: string): LocalCourseProgressStore {
  if (typeof window === 'undefined') return { modules: [] };
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return { modules: [] };
    const parsed = JSON.parse(raw) as LocalCourseProgressStore;
    if (!Array.isArray(parsed?.modules)) return { modules: [] };
    return {
      modules: parsed.modules.filter(
        (entry): entry is LocalModuleCompletion =>
          Boolean(entry?.moduleId) &&
          typeof entry.quizScore === 'number' &&
          typeof entry.gameScore === 'number'
      ),
    };
  } catch {
    return { modules: [] };
  }
}

function writeStore(slug: string, store: LocalCourseProgressStore) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(store));
  } catch {
    /* localStorage indisponible */
  }
}

export function readLocalCourseProgress(slug: string): LocalModuleCompletion[] {
  return readStore(slug).modules;
}

export function markLocalModuleComplete(
  slug: string,
  moduleId: string,
  scores: { quizScore: number; gameScore: number }
) {
  const store = readStore(slug);
  const completedAt = new Date().toISOString();
  const nextEntry: LocalModuleCompletion = {
    moduleId,
    quizScore: scores.quizScore,
    gameScore: scores.gameScore,
    completedAt,
  };
  const modules = [
    ...store.modules.filter((entry) => entry.moduleId !== moduleId),
    nextEntry,
  ];
  writeStore(slug, { modules });
}

export function clearLocalModuleCompletion(slug: string, moduleId: string) {
  const store = readStore(slug);
  if (!store.modules.some((entry) => entry.moduleId === moduleId)) return;
  writeStore(slug, {
    modules: store.modules.filter((entry) => entry.moduleId !== moduleId),
  });
}

export function hasLocalCourseProgress(slug: string) {
  return readLocalCourseProgress(slug).length > 0;
}

export function applyLocalCompletionsToProgress(
  slug: string,
  course: CourseDetail,
  base: CourseProgressData
): CourseProgressData {
  const localById = new Map(readLocalCourseProgress(slug).map((entry) => [entry.moduleId, entry]));

  const modules = course.modules.map((module, index) => {
    const existing = base.modules.find((item) => item.id === module.id);
    const local = localById.get(module.id);
    const completed = Boolean(existing?.completed || local);
    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
      sortOrder: existing?.sortOrder ?? index + 1,
      completed,
      completedAt: local?.completedAt ?? existing?.completedAt ?? (completed ? new Date().toISOString() : null),
      quizScore: local?.quizScore ?? existing?.quizScore ?? null,
      gameScore: local?.gameScore ?? existing?.gameScore ?? null,
      score: existing?.score ?? null,
    };
  });

  const completedModules = modules.filter((module) => module.completed).length;
  const totalModules = modules.length;
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const nextModule = modules.find((module) => !module.completed) ?? null;

  return {
    course: base.course,
    progress: {
      ...base.progress,
      totalModules,
      completedModules,
      progressPercent,
      nextModule: nextModule
        ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title }
        : null,
    },
    modules,
  };
}
