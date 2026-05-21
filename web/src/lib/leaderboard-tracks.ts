import type { LearningTrack } from '@ama/shared/learning-paths';
import { LEARNING_PATHS } from '@ama/shared/learning-paths';
import type { LeaderboardEntry } from '@/lib/api';

const BADGE_TO_TRACK: Record<string, LearningTrack> = {
  'apple-mdm-foundation': 'APPLE',
  'jamf-engineer': 'JAMF',
  'intune-professional': 'INTUNE',
};

export const LEADERBOARD_TRACK_FILTERS = ['TOUS', 'APPLE', 'JAMF', 'INTUNE'] as const;
export type LeaderboardTrackFilter = (typeof LEADERBOARD_TRACK_FILTERS)[number];

export function parseLeaderboardTrackParam(value: string | null): LeaderboardTrackFilter {
  if (!value) return 'TOUS';
  const normalized = value.toUpperCase();
  if (normalized === 'TOUS' || normalized === 'ALL') return 'TOUS';
  if (normalized === 'APPLE' || normalized === 'JAMF' || normalized === 'INTUNE') {
    return normalized;
  }
  return 'TOUS';
}

export function formatLeaderboardTrackFilter(track: LeaderboardTrackFilter): string {
  if (track === 'TOUS') return 'Toutes';
  const path = LEARNING_PATHS.find((entry) => entry.track === track);
  return path?.shortTitle ?? track;
}

export function getLeaderboardEntryTrack(entry: LeaderboardEntry): LearningTrack | null {
  if (entry.primaryTrack) return entry.primaryTrack;

  for (const badge of entry.badges) {
    const track = BADGE_TO_TRACK[badge];
    if (track) return track;
  }

  const name = entry.displayName.toLowerCase();
  if (name.includes('apple')) return 'APPLE';
  if (name.includes('jamf')) return 'JAMF';
  if (name.includes('intune')) return 'INTUNE';

  return null;
}

export function filterLeaderboardByTrack(
  entries: LeaderboardEntry[],
  track: LeaderboardTrackFilter
): LeaderboardEntry[] {
  if (track === 'TOUS') return entries;
  return entries.filter((entry) => getLeaderboardEntryTrack(entry) === track);
}
