import type { BrandId } from './brands';
import { getBadgeBrand, getTrackBrand } from './brands';

/** Tokens alignés sur MDM Academy Pro (web) */
export type AppThemeColors = {
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentTeal: string;
  accentTealSoft: string;
  bg: string;
  bgSoft: string;
  fg: string;
  muted: string;
  success: string;
  warning: string;
  demoBannerBg: string;
  demoBannerBorder: string;
  demoBannerText: string;
  border: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabBarInactive: string;
  radiusLg: number;
  radiusMd: number;
  radiusPill: number;
};

export const lightTheme: AppThemeColors = {
  accent: '#2563EB',
  accentStrong: '#1d4ed8',
  accentSoft: '#dbeafe',
  accentTeal: '#0d9488',
  accentTealSoft: '#ccfbf1',
  bg: '#f0f4ff',
  bgSoft: '#ffffff',
  fg: '#0f172a',
  muted: '#64748b',
  success: '#059669',
  warning: '#f59e0b',
  demoBannerBg: '#fff8e6',
  demoBannerBorder: '#f0cf7a',
  demoBannerText: '#8a5a00',
  border: '#e2e8f0',
  tabBarBg: '#ffffff',
  tabBarBorder: '#e5e7eb',
  tabBarInactive: '#6e6e73',
  radiusLg: 16,
  radiusMd: 12,
  radiusPill: 999,
};

export const darkTheme: AppThemeColors = {
  accent: '#3b82f6',
  accentStrong: '#60a5fa',
  accentSoft: '#1e3a5f',
  accentTeal: '#2dd4bf',
  accentTealSoft: '#134e4a',
  bg: '#0b1220',
  bgSoft: '#111827',
  fg: '#f1f5f9',
  muted: '#94a3b8',
  success: '#34d399',
  warning: '#fbbf24',
  demoBannerBg: '#422006',
  demoBannerBorder: '#78350f',
  demoBannerText: '#fcd34d',
  border: '#334155',
  tabBarBg: '#111827',
  tabBarBorder: '#1e293b',
  tabBarInactive: '#94a3b8',
  radiusLg: 16,
  radiusMd: 12,
  radiusPill: 999,
};

/** Thème clair par défaut — préférer `useAppTheme()` dans les écrans. */
export const theme = lightTheme;

export function getThemeColors(mode: 'light' | 'dark'): AppThemeColors {
  return mode === 'dark' ? darkTheme : lightTheme;
}

export type { BrandId } from './brands';
export { getBadgeBrand, getTrackBrand } from './brands';

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
  supporter: {
    label: 'Supporter',
    icon: '\u{1F49A}',
    color: '#059669',
    bg: '#ecfdf5',
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
  gradient: [string, string];
  minPoints: number;
  nextPoints: number | null;
  nextName: string | null;
}

const RANK_LADDER: { name: string; icon: string; color: string; gradient: [string, string]; minPoints: number }[] = [
  { name: 'Débutant', icon: '\u{1F331}', color: '#5d6373', gradient: ['#94a1b8', '#c5cfdd'], minPoints: 0 },
  { name: 'Apprenti', icon: '\u{1F33F}', color: '#2e844a', gradient: ['#2e844a', '#4cd964'], minPoints: 100 },
  { name: 'Technicien', icon: '\u{1F527}', color: '#2563eb', gradient: ['#2563eb', '#0d9488'], minPoints: 250 },
  { name: 'Ingénieur', icon: '\u{2699}\uFE0F', color: '#6c5ce7', gradient: ['#4834d4', '#a29bfe'], minPoints: 500 },
  { name: 'Expert', icon: '\u{1F3C5}', color: '#ff9e2c', gradient: ['#ff5b00', '#ffb02e'], minPoints: 900 },
  { name: 'Champion', icon: '\u{1F451}', color: '#c23934', gradient: ['#c23934', '#ff7a59'], minPoints: 1500 },
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

export function formatLevel(level: string) {
  return level
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export interface TrackVisual {
  label: string;
  icon?: string;
  brand?: BrandId;
  color: string;
  gradient: [string, string];
}

const TRACK_VISUALS: Record<string, TrackVisual> = {
  APPLE: {
    label: 'Apple Device Support',
    brand: 'apple',
    color: '#1d1d1f',
    gradient: ['#1d1d1f', '#7a7d8a'],
  },
  JAMF: {
    label: 'Jamf Pro',
    brand: 'jamf',
    color: '#ff5b00',
    gradient: ['#ff5b00', '#ff9e2c'],
  },
  INTUNE: {
    label: 'Microsoft Intune',
    brand: 'microsoft',
    color: '#2563eb',
    gradient: ['#2563eb', '#0d9488'],
  },
  DEFAULT: {
    label: 'Parcours',
    icon: '\u{1F393}',
    color: theme.accent,
    gradient: [theme.accentStrong, theme.accentTeal],
  },
  SPRINT: {
    label: 'Sprint certification',
    icon: '\u{26A1}',
    color: theme.accentStrong,
    gradient: ['#4338ca', theme.accent],
  },
};

export const ALL_BADGE_SLUGS = [
  'apple-mdm-foundation',
  'jamf-engineer',
  'intune-professional',
] as const;

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

export function getTrackVisual(track?: string | null): TrackVisual {
  if (!track) return TRACK_VISUALS.DEFAULT;
  return TRACK_VISUALS[track.toUpperCase()] ?? TRACK_VISUALS.DEFAULT;
}

export function formatTrack(track: string) {
  return getTrackVisual(track).label;
}

export type TrailLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';

export function inferLevelFromModules(totalModules?: number): TrailLevel {
  if (!totalModules) return 'Débutant';
  if (totalModules <= 3) return 'Débutant';
  if (totalModules <= 7) return 'Intermédiaire';
  return 'Avancé';
}

export function estimatePoints(totalModules?: number, level: TrailLevel = 'Débutant'): number {
  const count = Math.max(1, totalModules ?? 1);
  const factor = level === 'Avancé' ? 50 : level === 'Intermédiaire' ? 40 : 30;
  return count * factor;
}
