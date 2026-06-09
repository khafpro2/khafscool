import type { Metadata } from 'next';
import { parseLeaderboardTrackParam } from '@/lib/leaderboard-tracks';
import { BadgesPageClient } from './BadgesPageClient';

export const metadata: Metadata = {
  title: 'Mes badges',
  description:
    'Collection de badges MDM Academy : débloque des récompenses en complétant modules, quiz, examens blancs et quêtes sur Apple, Jamf et Intune.',
  openGraph: {
    title: 'Badges — MDM Academy',
    description: 'Tes récompenses de formation MDM : badges par piste, niveau et accomplissement.',
  },
  alternates: { canonical: '/badges' },
};

type BadgesPageProps = {
  searchParams: Promise<{ track?: string }>;
};

export default async function BadgesPage({ searchParams }: BadgesPageProps) {
  const params = await searchParams;
  const initialTrack = parseLeaderboardTrackParam(params.track ?? null);

  return <BadgesPageClient initialTrack={initialTrack} />;
}
