import { MVP_TRACK_SLUGS, type CourseSlug } from './learning-paths';

export const COURSE_SLUGS = [...MVP_TRACK_SLUGS] as const;

/** Nombre de questions quiz par module MVP (aligné seed + contenu). */
export const QUESTIONS_PER_MODULE = 10;

/** Modules par parcours lorsque différent du défaut MVP (3). */
export const MODULES_BY_COURSE: Partial<Record<CourseSlug, number>> = {
  'apple-cert-prep': 4,
};

export function getCourseModuleCount(slug: CourseSlug): number {
  return MODULES_BY_COURSE[slug] ?? 3;
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
