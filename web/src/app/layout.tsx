import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LEARNING_PATHS } from '@/lib/learningPaths';
import './globals.css';

export const metadata: Metadata = {
  title: 'MDM Academy Pro — Apple, Jamf Pro et Intune gratuits',
  description:
    'Formation gamifiée gratuite : Apple Device Support, Jamf Pro et Microsoft Intune. Quiz, mini-jeux, badges et sprints certification.',
};

const NAV_ITEMS = [
  { href: '/quests', label: 'Quêtes' },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/badges', label: 'Badges' },
  { href: '/sprint', label: 'Sprint' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="site-header">
          <div className="container site-header-inner">
            <Link href="/" className="site-logo" aria-label="Retour à l'accueil MDM Academy">
              <span className="site-logo-mark" aria-hidden>
                M
              </span>
              <span>
                MDM <span style={{ color: 'var(--accent)' }}>Academy</span>
              </span>
            </Link>
            <nav className="site-nav" aria-label="Navigation principale">
              <div className="nav-dropdown">
                <Link href="/courses" className="nav-dropdown-trigger">
                  Apprendre
                </Link>
                <div className="nav-dropdown-menu" role="menu">
                  {LEARNING_PATHS.map((path) => (
                    <Link key={path.slug} href={path.href} role="menuitem">
                      {path.shortTitle}
                    </Link>
                  ))}
                  <Link href="/courses" role="menuitem" className="nav-dropdown-all">
                    Tous les parcours →
                  </Link>
                </div>
              </div>
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="site-actions">
              <Button href="/profile" variant="ghost" size="sm">
                Profil
              </Button>
              <Button href="/auth" size="sm">
                Commencer gratuitement
              </Button>
            </div>
          </div>
        </header>
        <main className="container" style={{ paddingTop: '1.5rem' }}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="container site-footer-inner">
            <div>
              <strong>MDM Academy</strong> · Apple, Jamf Pro et Intune en mode jeu
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <Link href="/courses">Parcours</Link>
              <Link href="/demo">Démo</Link>
              <Link href="/resources">Ressources</Link>
              <Link href="/diagnostics">Diagnostics</Link>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
              Non affilié à Apple Inc., Jamf ou Microsoft.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
