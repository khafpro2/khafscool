import type { Metadata } from 'next';
import { leaderboardPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = leaderboardPageMetadata;

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
