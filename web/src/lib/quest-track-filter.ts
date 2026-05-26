import type { WeeklyQuest } from '@/lib/api';
import type { LeaderboardTrackFilter } from '@/lib/leaderboard-tracks';

export function getQuestTrack(quest: WeeklyQuest): string | null {
  const track = quest.track?.trim().toUpperCase();
  if (!track) return null;
  if (track === 'APPLE' || track === 'JAMF' || track === 'INTUNE') return track;
  return null;
}

export function filterQuestsByTrack(
  quests: WeeklyQuest[],
  track: LeaderboardTrackFilter
): WeeklyQuest[] {
  if (track === 'TOUS') return quests;
  return quests.filter((quest) => getQuestTrack(quest) === track);
}
