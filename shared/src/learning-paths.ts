export type LearningTrack = 'APPLE' | 'JAMF' | 'INTUNE';

export type BrandId = 'apple' | 'jamf' | 'microsoft';

export const MVP_TRACK_SLUGS = [
  'apple-cert-prep',
  'jamf-pro-foundations',
  'intune-ios-enrollment',
] as const;

export type CourseSlug = (typeof MVP_TRACK_SLUGS)[number];

export interface LearningPathDefinition {
  slug: CourseSlug;
  track: LearningTrack;
  brand: BrandId;
  title: string;
  shortTitle: string;
  durationMinutes: number;
  totalModules: number;
  objectives: [string, string, string];
}

export const LEARNING_PATHS: LearningPathDefinition[] = [
  {
    slug: 'apple-cert-prep',
    track: 'APPLE',
    brand: 'apple',
    title: 'Parcours Apple — Device Support & MDM',
    shortTitle: 'Apple Device Support',
    durationMinutes: 60,
    totalModules: 4,
    objectives: [
      'Diagnostiquer pannes matérielles et logicielles sur Mac, iPhone et iPad',
      'Sécuriser sauvegardes, restaurations et Activation Lock en atelier',
      'Gérer apps VPP et préparer l’examen Apple Device Support',
    ],
  },
  {
    slug: 'jamf-pro-foundations',
    track: 'JAMF',
    brand: 'jamf',
    title: 'Fondamentaux Jamf Pro',
    shortTitle: 'Jamf Pro',
    durationMinutes: 60,
    totalModules: 4,
    objectives: [
      'Cibler des appareils avec smart groups et déployer des politiques pilotes',
      'Lire l’inventaire Jamf et prioriser la conformité du parc',
      'Enrôler une flotte supervisée via Apple Business Manager',
      'Automatiser exports et scripts avancés via l’API Jamf Pro',
    ],
  },
  {
    slug: 'intune-ios-enrollment',
    track: 'INTUNE',
    brand: 'microsoft',
    title: 'Microsoft Intune — Enrôlement iOS/iPadOS',
    shortTitle: 'Microsoft Intune',
    durationMinutes: 60,
    totalModules: 4,
    objectives: [
      'Configurer l’enrôlement automatisé (ADE) pour iPhone et iPad',
      'Déployer politiques de conformité et actions correctives',
      'Protéger les apps M365 avec App Protection et Conditional Access',
      'Distribuer apps VPP et apps métier via ABM et Intune',
    ],
  },
];

export function getLearningPath(slug: string): LearningPathDefinition | undefined {
  return LEARNING_PATHS.find((path) => path.slug === slug);
}
