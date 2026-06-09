import type { Metadata } from 'next';
import { parseLeaderboardTrackParam } from '@/lib/leaderboard-tracks';
import { QuestsPageClient } from './QuestsPageClient';

export const metadata: Metadata = {
  title: 'Quêtes hebdomadaires',
  description:
    'Accomplis tes quêtes MDM de la semaine : modules à finir, quiz à réussir et badges à débloquer sur Apple, Jamf Pro et Intune.',
  openGraph: {
    title: 'Quêtes hebdomadaires — MDM Academy',
    description: 'Objectifs gamifiés de la semaine pour progresser sur Apple, Jamf et Intune.',
  },
  alternates: { canonical: '/quests' },
};

type QuestsPageProps = {
  searchParams: Promise<{ track?: string }>;
};

export default async function WeeklyQuestsPage({ searchParams }: QuestsPageProps) {
  const params = await searchParams;
  const initialTrack = parseLeaderboardTrackParam(params.track ?? null);

  return <QuestsPageClient initialTrack={initialTrack} />;
}
