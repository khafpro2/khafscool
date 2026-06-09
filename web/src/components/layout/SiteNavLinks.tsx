'use client';

import Link from 'next/link';
import { QuestNavDot } from '@/components/layout/QuestNavIndicator';

const NAV_ITEMS = [
  { href: '/courses', label: 'Parcours' },
  { href: '/quests', label: 'Quêtes', showQuestDot: true as const },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/badges', label: 'Badges' },
  { href: '/sprint', label: 'Sprint' },
] as const;

export function SiteNavLinks() {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={'showQuestDot' in item && item.showQuestDot ? 'nav-link-quests' : undefined}
        >
          <span className="nav-link-label">{item.label}</span>
          {'showQuestDot' in item && item.showQuestDot ? <QuestNavDot /> : null}
        </Link>
      ))}
    </>
  );
}
