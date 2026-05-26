import { LEARNING_PATHS, type LearningTrack } from '@ama/shared/learning-paths';

export const TRACK_FILTERS = ['TOUS', 'APPLE', 'JAMF', 'INTUNE'] as const;
export type TrackFilter = (typeof TRACK_FILTERS)[number];

const BADGE_TO_TRACK: Record<string, LearningTrack> = {
  'apple-mdm-foundation': 'APPLE',
  'jamf-engineer': 'JAMF',
  'intune-professional': 'INTUNE',
};

export function formatTrackFilter(track: TrackFilter): string {
  if (track === 'TOUS') return 'Toutes';
  const path = LEARNING_PATHS.find((entry) => entry.track === track);
  return path?.shortTitle ?? track;
}

export interface LeaderboardFilterEntry {
  displayName: string;
  badges: string[];
  primaryTrack?: LearningTrack | null;
}

export function getLeaderboardEntryTrack(entry: LeaderboardFilterEntry): LearningTrack | null {
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

export function filterLeaderboardByTrack<T extends LeaderboardFilterEntry>(
  entries: T[],
  track: TrackFilter
): T[] {
  if (track === 'TOUS') return entries;
  return entries.filter((entry) => getLeaderboardEntryTrack(entry) === track);
}
