import { parseLeaderboardTrackParam } from '@/lib/leaderboard-tracks';
import { LeaderboardPageClient } from './LeaderboardPageClient';

type LeaderboardPageProps = {
  searchParams: Promise<{ track?: string }>;
};

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const initialTrack = parseLeaderboardTrackParam(params.track ?? null);

  return <LeaderboardPageClient initialTrack={initialTrack} />;
}
