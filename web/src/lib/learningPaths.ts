import type { BrandId } from '@/lib/brands';
import type { TrailLevel } from '@/lib/design';

export const MVP_TRACK_SLUGS = [
  'apple-cert-prep',
  'jamf-pro-foundations',
  'intune-ios-enrollment',
] as const;

export type MvpTrackSlug = (typeof MVP_TRACK_SLUGS)[number];

export interface LearningPathMeta {
  slug: MvpTrackSlug;
  track: 'APPLE' | 'JAMF' | 'INTUNE';
  brand: BrandId;
  title: string;
  shortTitle: string;
  href: string;
  durationMinutes: number;
  totalModules: number;
  level: TrailLevel;
  recommended?: boolean;
  audience: string;
  certificationTarget: string;
  objectives: [string, string, string];
}

export const LEARNING_PATHS: LearningPathMeta[] = [
  {
    slug: 'apple-cert-prep',
    track: 'APPLE',
    brand: 'apple',
    title: 'Parcours Apple — Device Support & MDM',
    shortTitle: 'Apple Device Support',
    href: '/courses/apple-cert-prep',
    durationMinutes: 45,
    totalModules: 3,
    level: 'Débutant',
    recommended: true,
    audience: 'Techniciens support, helpdesk Apple et débutants MDM',
    certificationTarget: 'Apple Device Support (ACMT / fondamentaux)',
    objectives: [
      'Diagnostiquer pannes matérielles et logicielles sur Mac, iPhone et iPad',
      'Sécuriser sauvegardes, restaurations et Activation Lock en atelier',
      'Structurer ta préparation à l’examen Apple Device Support',
    ],
  },
  {
    slug: 'jamf-pro-foundations',
    track: 'JAMF',
    brand: 'jamf',
    title: 'Fondamentaux Jamf Pro',
    shortTitle: 'Jamf Pro',
    href: '/courses/jamf-pro-foundations',
    durationMinutes: 45,
    totalModules: 3,
    level: 'Intermédiaire',
    audience: 'Administrateurs MDM Jamf et responsables flotte Apple',
    certificationTarget: 'Jamf Certified Admin (fondations)',
    objectives: [
      'Cibler des appareils avec smart groups et déployer des politiques pilotes',
      'Lire l’inventaire Jamf et prioriser la conformité du parc',
      'Enrôler une flotte supervisée via Apple Business Manager',
    ],
  },
  {
    slug: 'intune-ios-enrollment',
    track: 'INTUNE',
    brand: 'microsoft',
    title: 'Microsoft Intune — Enrôlement iOS/iPadOS',
    shortTitle: 'Microsoft Intune',
    href: '/courses/intune-ios-enrollment',
    durationMinutes: 45,
    totalModules: 3,
    level: 'Intermédiaire',
    audience: 'Admins Microsoft 365 / Entra et équipes endpoint hybrides',
    certificationTarget: 'Microsoft Intune (MD-102 — partie mobile)',
    objectives: [
      'Configurer l’enrôlement automatisé (ADE) pour iPhone et iPad',
      'Déployer politiques de conformité et actions correctives',
      'Protéger les apps M365 avec App Protection et Conditional Access',
    ],
  },
];

export function getLearningPath(slug: string): LearningPathMeta | undefined {
  return LEARNING_PATHS.find((path) => path.slug === slug);
}

export function sortMvpCoursesFirst<T extends { slug: string }>(courses: T[]): T[] {
  const order = new Map(MVP_TRACK_SLUGS.map((slug, index) => [slug, index]));
  return [...courses].sort((a, b) => {
    const aIndex = order.get(a.slug as MvpTrackSlug) ?? 99;
    const bIndex = order.get(b.slug as MvpTrackSlug) ?? 99;
    return aIndex - bIndex;
  });
}
