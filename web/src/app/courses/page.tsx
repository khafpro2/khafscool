import { parseLeaderboardTrackParam } from '@/lib/leaderboard-tracks';
import { CoursesPageClient } from './CoursesPageClient';

type CoursesPageProps = {
  searchParams: Promise<{ track?: string }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const initialTrack = parseLeaderboardTrackParam(params.track ?? null);

  return <CoursesPageClient initialTrack={initialTrack} />;
}
