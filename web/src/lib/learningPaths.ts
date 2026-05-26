import {
  LEARNING_PATHS as SHARED_PATHS,
  MVP_TRACK_SLUGS,
  type CourseSlug,
  type LearningPathDefinition,
} from '@ama/shared/learning-paths';
import type { TrailLevel } from '@/lib/design';

export { MVP_TRACK_SLUGS };

export type MvpTrackSlug = CourseSlug;

export interface LearningPathMeta extends LearningPathDefinition {
  href: string;
  level: TrailLevel;
  recommended?: boolean;
  audience: string;
  certificationTarget: string;
}

const WEB_META: Record<
  CourseSlug,
  Omit<LearningPathMeta, keyof LearningPathDefinition | 'href'>
> = {
  'apple-cert-prep': {
    level: 'Débutant',
    recommended: true,
    audience: 'Techniciens support, helpdesk Apple et débutants MDM',
    certificationTarget: 'Apple Device Support (ACMT / fondamentaux)',
  },
  'jamf-pro-foundations': {
    level: 'Intermédiaire',
    audience: 'Administrateurs MDM Jamf et responsables flotte Apple',
    certificationTarget: 'Jamf Certified Admin (fondations)',
  },
  'intune-ios-enrollment': {
    level: 'Intermédiaire',
    audience: 'Admins Microsoft 365 / Entra et équipes endpoint hybrides',
    certificationTarget: 'Microsoft Intune (MD-102 — partie mobile)',
  },
};

export const LEARNING_PATHS: LearningPathMeta[] = SHARED_PATHS.map((path) => ({
  ...path,
  ...WEB_META[path.slug],
  href: `/courses/${path.slug}`,
}));

export function getLearningPath(slug: string): LearningPathMeta | undefined {
  return LEARNING_PATHS.find((path) => path.slug === slug);
}

export function sortMvpCoursesFirst<T extends { slug: string }>(courses: T[]): T[] {
  const order = new Map(MVP_TRACK_SLUGS.map((slug, index) => [slug, index]));
  return [...courses].sort((a, b) => {
    const aIndex = order.get(a.slug as CourseSlug) ?? 99;
    const bIndex = order.get(b.slug as CourseSlug) ?? 99;
    return aIndex - bIndex;
  });
}
