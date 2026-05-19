export interface BadgeVisual {
  label: string;
  icon: string;
  color: string;
  bg: string;
}

const BADGE_VISUALS: Record<string, BadgeVisual> = {
  'apple-mdm-foundation': {
    label: 'Fondamentaux Apple MDM',
    icon: '\u{1F34F}',
    color: '#1d1d1f',
    bg: '#f1f1f4',
  },
  'jamf-engineer': {
    label: 'Ingénieur Jamf',
    icon: '\u{1F6E1}',
    color: '#a23d00',
    bg: '#fff1e4',
  },
  'intune-professional': {
    label: 'Professionnel Intune',
    icon: '\u{1F4BC}',
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
  gradient: [string, string];
  minPoints: number;
  nextPoints: number | null;
  nextName: string | null;
}

const RANK_LADDER: { name: string; icon: string; color: string; gradient: [string, string]; minPoints: number }[] = [
  { name: 'Novice', icon: '\u{1F331}', color: '#5d6373', gradient: ['#94a1b8', '#c5cfdd'], minPoints: 0 },
  { name: 'Apprenti', icon: '\u{1F33F}', color: '#2e844a', gradient: ['#2e844a', '#4cd964'], minPoints: 100 },
  { name: 'Technicien', icon: '\u{1F527}', color: '#0070d2', gradient: ['#0070d2', '#16cdf1'], minPoints: 250 },
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
  icon: string;
  color: string;
  gradient: [string, string];
}

const TRACK_VISUALS: Record<string, TrackVisual> = {
  APPLE: {
    label: 'Apple Device Support',
    icon: '\u{1F34E}',
    color: '#1d1d1f',
    gradient: ['#1d1d1f', '#7a7d8a'],
  },
  JAMF: {
    label: 'Jamf Pro',
    icon: '\u{1F6E1}',
    color: '#ff5b00',
    gradient: ['#ff5b00', '#ff9e2c'],
  },
  INTUNE: {
    label: 'Microsoft Intune',
    icon: '\u2601\uFE0F',
    color: '#0070d2',
    gradient: ['#0070d2', '#16cdf1'],
  },
  DEFAULT: {
    label: 'Parcours',
    icon: '\u{1F393}',
    color: '#0070d2',
    gradient: ['#032d60', '#16cdf1'],
  },
};

export function getTrackVisual(track?: string | null): TrackVisual {
  if (!track) return TRACK_VISUALS.DEFAULT;
  return TRACK_VISUALS[track.toUpperCase()] ?? TRACK_VISUALS.DEFAULT;
}

export function formatTrack(track: string) {
  return getTrackVisual(track).label;
}
