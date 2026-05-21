import { parseLeaderboardTrackParam } from '@/lib/leaderboard-tracks';
import { BadgesPageClient } from './BadgesPageClient';

type BadgesPageProps = {
  searchParams: Promise<{ track?: string }>;
};

export default async function BadgesPage({ searchParams }: BadgesPageProps) {
  const params = await searchParams;
  const initialTrack = parseLeaderboardTrackParam(params.track ?? null);

  return <BadgesPageClient initialTrack={initialTrack} />;
}
