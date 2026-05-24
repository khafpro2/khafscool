import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import { ApiHealthPoller } from '@/components/layout/ApiHealthPoller';
import { ApiStatusBanner } from '@/components/layout/ApiStatusBanner';
import { DemoModeBanner } from '@/components/layout/DemoModeBanner';
import { SiteMobileNav } from '@/components/layout/SiteMobileNav';
import { SiteNavLinks } from '@/components/layout/SiteNavLinks';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { CookieConsentBanner } from '@/components/layout/CookieConsentBanner';
import { GlossaryNavSearch } from '@/components/layout/GlossaryNavSearch';
import { AnalyticsOptInBanner } from '@/components/layout/AnalyticsOptInBanner';
import { PointsRankNavIndicator } from '@/components/layout/PointsRankNavIndicator';
import { StreakNavBadge } from '@/components/layout/StreakNavIndicator';
import { Toaster } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { getContactMailto } from '@/lib/contact';
import { LEARNING_PATHS } from '@/lib/learningPaths';
import { SessionBootstrap } from '@/components/layout/SessionBootstrap';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

const siteUrl = process.env.WEB_URL ?? 'http://127.0.0.1:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MDM Academy Pro — Apple, Jamf Pro et Intune gratuits',
    template: '%s | MDM Academy',
  },
  description:
    'Formation gamifiée gratuite : Apple Device Support, Jamf Pro et Microsoft Intune. Quiz, mini-jeux, badges et sprints certification.',
  keywords: [
    'MDM',
    'Apple Device Support',
    'Jamf Pro',
    'Microsoft Intune',
    'formation Apple',
    'certification MDM',
    'enrôlement iOS',
  ],
  authors: [{ name: 'MDM Academy' }],
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icon-192', type: 'image/png', sizes: '192x192' }],
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'MDM Academy',
    title: 'MDM Academy Pro — Apple, Jamf Pro et Intune gratuits',
    description:
      'Formation gamifiée gratuite : Apple Device Support, Jamf Pro et Microsoft Intune. Quiz, mini-jeux, badges et sprints certification.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'MDM Academy Pro — Apple, Jamf Pro et Intune gratuits',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MDM Academy Pro — Apple, Jamf Pro et Intune gratuits',
    description:
      'Formation gamifiée gratuite : Apple Device Support, Jamf Pro et Microsoft Intune.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'MDM Academy Pro',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const contactMailto = getContactMailto();

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SessionBootstrap />
        <a href="#main-content" className="skip-link">
          Aller au contenu
        </a>
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
              <SiteNavLinks />
              <GlossaryNavSearch />
            </nav>
            <SiteMobileNav />
            <div className="site-actions">
              <PointsRankNavIndicator />
              <StreakNavBadge />
              <ThemeToggle />
              <Button href="/profile" variant="ghost" size="sm" className="site-action-profile">
                Profil
              </Button>
              <Button href="/auth" size="sm" className="site-action-cta">
                Commencer gratuitement
              </Button>
            </div>
          </div>
        </header>
        <ApiHealthPoller />
        <ApiStatusBanner />
        <DemoModeBanner />
        <main id="main-content" className="container" style={{ paddingTop: '1.5rem' }}>
          <AppErrorBoundary>{children}</AppErrorBoundary>
        </main>
        <Toaster />
        <CookieConsentBanner />
        <AnalyticsOptInBanner />
        <footer className="site-footer">
          <div className="container site-footer-inner">
            <div>
              <strong>MDM Academy</strong> · Apple, Jamf Pro et Intune en mode jeu
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/courses">Parcours</Link>
              <Link href="/resources">Ressources</Link>
              <Link href="/about">À propos</Link>
              <Link href={contactMailto}>Nous contacter</Link>
              <Link href="/soutenir">Faire un don</Link>
              <Link href="/demo">Démo</Link>
              <Link href="/diagnostics" className="site-footer-tools">
                Diagnostics
              </Link>
              <Link href="/legal/confidentialite">Confidentialité</Link>
              <Link href="/legal/conditions">Conditions</Link>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
              Non affilié à Apple Inc., Jamf ou Microsoft. ·{' '}
              <Link href={contactMailto} style={{ color: 'inherit' }}>
                Assistance
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
