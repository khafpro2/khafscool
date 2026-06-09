'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QuestNavDot } from '@/components/layout/QuestNavIndicator';

const NAV_ITEMS = [
  { href: '/courses', label: 'Parcours' },
  { href: '/quests', label: 'Quêtes', showQuestDot: true as const },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/badges', label: 'Badges' },
  { href: '/sprint', label: 'Sprint' },
] as const;

export function SiteNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const baseClass = 'showQuestDot' in item && item.showQuestDot ? 'nav-link-quests' : '';
        const activeClass = isActive ? 'nav-link-active' : '';
        const className = [baseClass, activeClass].filter(Boolean).join(' ') || undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={className}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-link-label">{item.label}</span>
            {'showQuestDot' in item && item.showQuestDot ? <QuestNavDot /> : null}
          </Link>
        );
      })}
    </>
  );
}
