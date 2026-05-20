import type { BrandId } from '@/lib/brands';
import { getBadgeBrand, getTrackBrand } from '@/lib/brands';

export type { BrandId } from '@/lib/brands';
export { getBadgeBrand, getTrackBrand } from '@/lib/brands';

export type TrailLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';

export interface TrackVisual {
  label: string;
  icon?: string;
  brand?: BrandId;
  color: string;
  gradient: string;
  defaultLevel: TrailLevel;
}

const TRACK_VISUALS: Record<string, TrackVisual> = {
  APPLE: {
    label: 'Apple Device Support',
    brand: 'apple',
    color: '#1d1d1f',
    gradient: 'var(--track-apple)',
    defaultLevel: 'Débutant',
  },
  JAMF: {
    label: 'Jamf Pro',
    brand: 'jamf',
    color: '#ea580c',
    gradient: 'var(--track-jamf)',
    defaultLevel: 'Intermédiaire',
  },
  INTUNE: {
    label: 'Microsoft Intune',
    brand: 'microsoft',
    color: '#2563eb',
    gradient: 'var(--track-intune)',
    defaultLevel: 'Intermédiaire',
  },
  SPRINT: {
    label: 'Sprint certification',
    icon: '\u{1F3C1}',
    color: '#6c5ce7',
    gradient: 'linear-gradient(135deg, #4834d4 0%, #6c5ce7 60%, #a29bfe 100%)',
    defaultLevel: 'Avancé',
  },
  RESOURCES: {
    label: 'Ressources officielles',
    icon: '\u{1F4DA}',
    color: '#0f7a3b',
    gradient: 'linear-gradient(135deg, #0f7a3b 0%, #4cd964 100%)',
    defaultLevel: 'Débutant',
  },
  QUESTS: {
    label: 'Quêtes hebdo',
    icon: '\u{1F3AF}',
    color: '#ffb02e',
    gradient: 'linear-gradient(135deg, #ffb02e 0%, #ffce5b 100%)',
    defaultLevel: 'Débutant',
  },
  LEADERBOARD: {
    label: 'Classement',
    icon: '\u{1F3C6}',
    color: '#c23934',
    gradient: 'linear-gradient(135deg, #c23934 0%, #ff7a59 100%)',
    defaultLevel: 'Intermédiaire',
  },
  DEFAULT: {
    label: 'Parcours',
    icon: '\u{1F393}',
    color: '#2563eb',
    gradient: 'var(--gradient-hero)',
    defaultLevel: 'Débutant',
  },
};

export function getTrackVisual(track?: string | null): TrackVisual {
  if (!track) return TRACK_VISUALS.DEFAULT;
  return TRACK_VISUALS[track.toUpperCase()] ?? TRACK_VISUALS.DEFAULT;
}

export interface BadgeVisual {
  label: string;
  icon?: string;
  brand?: BrandId;
  color: string;
  bg: string;
}

const BADGE_VISUALS: Record<string, BadgeVisual> = {
  'apple-mdm-foundation': {
    label: 'Fondamentaux Apple MDM',
    brand: 'apple',
    color: '#1d1d1f',
    bg: '#f1f1f4',
  },
  'jamf-engineer': {
    label: 'Ingénieur Jamf',
    brand: 'jamf',
    color: '#a23d00',
    bg: '#fff1e4',
  },
  'intune-professional': {
    label: 'Professionnel Intune',
    brand: 'microsoft',
    color: '#0050a0',
    bg: '#e3f0ff',
  },
};

export function getBadgeVisual(badge: string): BadgeVisual {
  return (
    BADGE_VISUALS[badge] ?? {
      label: prettify(badge),
      icon: '\u{1F3C5}',
      color: '#16191f',
      bg: '#eef0f5',
    }
  );
}

function prettify(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export interface RankInfo {
  name: string;
  icon: string;
  color: string;
  gradient: string;
  minPoints: number;
  nextPoints: number | null;
  nextName: string | null;
}

const RANK_LADDER: { name: string; icon: string; color: string; gradient: string; minPoints: number }[] = [
  { name: 'Débutant', icon: '\u{1F331}', color: '#5d6373', gradient: 'linear-gradient(135deg, #94a1b8 0%, #c5cfdd 100%)', minPoints: 0 },
  { name: 'Apprenti', icon: '\u{1F33F}', color: '#2e844a', gradient: 'linear-gradient(135deg, #2e844a 0%, #4cd964 100%)', minPoints: 100 },
  { name: 'Technicien', icon: '\u{1F527}', color: '#2563eb', gradient: 'var(--gradient-accent)', minPoints: 250 },
  { name: 'Ingénieur', icon: '\u{2699}\uFE0F', color: '#6c5ce7', gradient: 'linear-gradient(135deg, #4834d4 0%, #a29bfe 100%)', minPoints: 500 },
  { name: 'Expert', icon: '\u{1F3C5}', color: '#ff9e2c', gradient: 'linear-gradient(135deg, #ff5b00 0%, #ffb02e 100%)', minPoints: 900 },
  { name: 'Champion', icon: '\u{1F451}', color: '#c23934', gradient: 'linear-gradient(135deg, #c23934 0%, #ff7a59 100%)', minPoints: 1500 },
];

export function getRankInfo(points: number): RankInfo {
  const safe = Math.max(0, Math.floor(points || 0));
  let currentIndex = 0;
  for (let i = 0; i < RANK_LADDER.length; i += 1) {
    if (safe >= RANK_LADDER[i].minPoints) currentIndex = i;
  }
  const current = RANK_LADDER[currentIndex];
  const next = RANK_LADDER[currentIndex + 1] ?? null;
  return {
    name: current.name,
    icon: current.icon,
    color: current.color,
    gradient: current.gradient,
    minPoints: current.minPoints,
    nextPoints: next ? next.minPoints : null,
    nextName: next ? next.name : null,
  };
}

export function inferLevelFromModules(totalModules?: number): TrailLevel {
  if (!totalModules) return 'Débutant';
  if (totalModules <= 3) return 'Débutant';
  if (totalModules <= 7) return 'Intermédiaire';
  return 'Avancé';
}

export function estimateDurationMinutes(totalModules?: number): number {
  const count = Math.max(1, totalModules ?? 1);
  return count * 12;
}

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest.toString().padStart(2, '0')}`;
}

export function estimatePoints(totalModules?: number, level: TrailLevel = 'Débutant'): number {
  const count = Math.max(1, totalModules ?? 1);
  const factor = level === 'Avancé' ? 50 : level === 'Intermédiaire' ? 40 : 30;
  return count * factor;
}

export interface RewardBadgeForTrack {
  badgeSlug: string;
  label: string;
  brand: BrandId;
}

const REWARD_BY_TRACK: Record<string, RewardBadgeForTrack> = {
  APPLE: { badgeSlug: 'apple-mdm-foundation', label: 'Fondamentaux Apple MDM', brand: 'apple' },
  JAMF: { badgeSlug: 'jamf-engineer', label: 'Ingénieur Jamf', brand: 'jamf' },
  INTUNE: { badgeSlug: 'intune-professional', label: 'Professionnel Intune', brand: 'microsoft' },
};

export function getRewardBadgeForTrack(track?: string | null): RewardBadgeForTrack | null {
  if (!track) return null;
  return REWARD_BY_TRACK[track.toUpperCase()] ?? null;
}

export const ALL_BADGE_SLUGS = [
  'apple-mdm-foundation',
  'jamf-engineer',
  'intune-professional',
] as const;

export type BadgeSlug = (typeof ALL_BADGE_SLUGS)[number];

const BADGE_TRACK: Record<string, string> = {
  'apple-mdm-foundation': 'APPLE',
  'jamf-engineer': 'JAMF',
  'intune-professional': 'INTUNE',
};

const BADGE_CRITERIA: Record<string, string> = {
  'apple-mdm-foundation': 'Termine au moins une unité du parcours Apple Device Support.',
  'jamf-engineer': 'Termine au moins une unité du parcours Jamf Pro.',
  'intune-professional': 'Termine au moins une unité du parcours Microsoft Intune.',
};

export function getBadgeTrack(slug: string): string {
  return BADGE_TRACK[slug] ?? 'DEFAULT';
}

export function getBadgeCriteria(slug: string): string {
  return BADGE_CRITERIA[slug] ?? 'Complète le parcours associé pour débloquer ce super-badge.';
}
