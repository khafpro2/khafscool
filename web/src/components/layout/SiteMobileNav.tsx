'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { QuestNavDot } from '@/components/layout/QuestNavIndicator';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LEARNING_PATHS } from '@/lib/learningPaths';

const NAV_LINKS = [
  { href: '/quests', label: 'Quêtes', showQuestDot: true as const },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/badges', label: 'Badges' },
  { href: '/sprint', label: 'Sprint' },
] as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SiteMobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        )
      : [];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || focusables.length === 0) return;

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return (
    <div className="site-mobile-nav">
      <button
        ref={menuButtonRef}
        type="button"
        className="site-nav-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu de navigation'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="site-nav-toggle-bars" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>

      {open ? (
        <button
          type="button"
          className="site-nav-backdrop"
          aria-label="Fermer le menu"
          onClick={close}
        />
      ) : null}

      <nav
        ref={panelRef}
        id={panelId}
        className={`site-nav-drawer${open ? ' site-nav-drawer-open' : ''}`}
        aria-label="Navigation mobile"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
      >
        <div className="site-nav-drawer-head">
          <span className="site-nav-drawer-title">Menu</span>
          <button type="button" className="site-nav-drawer-close" onClick={close}>
            Fermer
          </button>
        </div>

        <div className="site-nav-drawer-section">
          <span className="site-nav-drawer-label">Apprendre</span>
          {LEARNING_PATHS.map((path) => (
            <Link key={path.slug} href={path.href} className="site-nav-drawer-link" onClick={close}>
              {path.shortTitle}
            </Link>
          ))}
          <Link href="/courses" className="site-nav-drawer-link site-nav-drawer-link-accent" onClick={close}>
            Tous les parcours →
          </Link>
        </div>

        <div className="site-nav-drawer-section">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-nav-drawer-link${'showQuestDot' in item && item.showQuestDot ? ' nav-link-quests' : ''}`}
              onClick={close}
            >
              <span className="nav-link-label">{item.label}</span>
              {'showQuestDot' in item && item.showQuestDot ? <QuestNavDot /> : null}
            </Link>
          ))}
          <Link href="/profile" className="site-nav-drawer-link" onClick={close}>
            Profil
          </Link>
        </div>

        <div className="site-nav-drawer-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="site-nav-drawer-label" style={{ padding: 0 }}>
              Apparence
            </span>
            <ThemeToggle />
          </div>
          <Link href="/auth" className="btn btn-sm" onClick={close}>
            Commencer gratuitement
          </Link>
        </div>
      </nav>
    </div>
  );
}
