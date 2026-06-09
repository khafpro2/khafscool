import type { Metadata, Viewport } from 'next';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import { ApiHealthPoller } from '@/components/layout/ApiHealthPoller';
import { ApiStatusBanner } from '@/components/layout/ApiStatusBanner';
import { DemoModeBanner } from '@/components/layout/DemoModeBanner';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { CookieConsentBanner } from '@/components/layout/CookieConsentBanner';
import { CookiePreferencesModal } from '@/components/layout/CookiePreferencesModal';
import { AnalyticsOptInBanner } from '@/components/layout/AnalyticsOptInBanner';
import { Toaster } from '@/components/ui/Toast';
import { SessionBootstrap } from '@/components/layout/SessionBootstrap';
import { bodyFont, displayFont, helloFont } from '@/lib/fonts';
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
    'Formation gamifiée gratuite : Apple Device Support, Jamf Pro et Microsoft Intune. Quiz, mini-jeux, badges et sprints certification.',
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
      'Formation gamifiée gratuite : Apple Device Support, Jamf Pro et Microsoft Intune. Quiz, mini-jeux, badges et sprints certification.',
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
      'Formation gamifiée gratuite : Apple Device Support, Jamf Pro et Microsoft Intune.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
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
  return (
    <html
      lang="fr"
      className={`${bodyFont.variable} ${displayFont.variable} ${helloFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SessionBootstrap />
        <a href="#main-content" className="skip-link">
          Aller au contenu
        </a>
        <SiteHeader />
        <ApiHealthPoller />
        <ApiStatusBanner />
        <DemoModeBanner />
        <main id="main-content" className="container" style={{ paddingTop: '1.5rem' }}>
          <AppErrorBoundary>{children}</AppErrorBoundary>
        </main>
        <Toaster />
        <CookieConsentBanner />
        <CookiePreferencesModal />
        <AnalyticsOptInBanner />
        <SiteFooter />
      </body>
    </html>
  );
}
