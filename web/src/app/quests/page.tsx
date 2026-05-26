import { parseLeaderboardTrackParam } from '@/lib/leaderboard-tracks';
import { QuestsPageClient } from './QuestsPageClient';

type QuestsPageProps = {
  searchParams: Promise<{ track?: string }>;
};

export default async function WeeklyQuestsPage({ searchParams }: QuestsPageProps) {
  const params = await searchParams;
  const initialTrack = parseLeaderboardTrackParam(params.track ?? null);

  return <QuestsPageClient initialTrack={initialTrack} />;
}
