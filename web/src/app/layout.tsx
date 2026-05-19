import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import './globals.css';

export const metadata: Metadata = {
  title: 'MDM Academy — Formation Apple, Jamf et Intune',
  description:
    'Plateforme gamifiée pour techniciens Apple et administrateurs MDM : parcours, unités, badges et préparation aux certifications.',
};

const NAV_ITEMS = [
  { href: '/courses', label: 'Parcours' },
  { href: '/quests', label: 'Quêtes' },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/badges', label: 'Badges' },
  { href: '/sprint', label: 'Sprint' },
  { href: '/pricing', label: 'Tarifs' },
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
                Se connecter
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
              <strong>MDM Academy</strong> · Apple, Jamf et Intune en mode jeu
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <Link href="/demo">Démo</Link>
              <Link href="/resources">Ressources</Link>
              <Link href="/diagnostics">Diagnostics</Link>
              <Link href="/mvp">MVP</Link>
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
