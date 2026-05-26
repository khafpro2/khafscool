import type { CourseSlug } from './learning-paths.js';

export const COURSE_SLUGS = [
  'apple-cert-prep',
  'jamf-pro-foundations',
  'intune-ios-enrollment',
] as const satisfies readonly CourseSlug[];

/** Nombre de questions quiz par module MVP (aligné seed + contenu). */
export const QUESTIONS_PER_MODULE = 10;

/** Modules par parcours lorsque différent du défaut MVP (3). */
export const MODULES_BY_COURSE: Partial<Record<CourseSlug, number>> = {
  'apple-cert-prep': 4,
  'jamf-pro-foundations': 4,
  'intune-ios-enrollment': 4,
};

export function getCourseModuleCount(slug: CourseSlug): number {
  return MODULES_BY_COURSE[slug] ?? 3;
}

/** Nombre total de questions quiz pour un parcours MVP. */
export function getCourseQuestionCount(slug: CourseSlug): number {
  return getCourseModuleCount(slug) * QUESTIONS_PER_MODULE;
}

/** Bonus exam-only par parcours (module 4 : 2 existantes + 2 nouvelles). */
export const PRACTICE_EXAM_BONUS_PER_COURSE = 4;

/** Taille du pool examen blanc (40 Q parcours + bonus module final). */
export function getPracticeExamPoolSize(slug: CourseSlug): number {
  return getCourseQuestionCount(slug) + PRACTICE_EXAM_BONUS_PER_COURSE;
}

export type NextCourseLink = { slug: CourseSlug; title: string };

export const NEXT_COURSE_BY_SLUG: Partial<Record<CourseSlug, NextCourseLink>> = {
  'apple-cert-prep': { slug: 'jamf-pro-foundations', title: 'Fondamentaux Jamf Pro' },
  'jamf-pro-foundations': { slug: 'intune-ios-enrollment', title: 'Microsoft Intune pour Apple' },
};

/** Compte démo seedé (API) et affiché dans l’UI locale — voir `pnpm db:seed`. */
export const DEMO_ACCOUNT = {
  email: 'demo@mdmacademy.local',
  password: 'DemoTest2026!',
  displayName: 'Technicien démo',
} as const;
