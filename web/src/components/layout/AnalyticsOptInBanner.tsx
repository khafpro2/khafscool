'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { readAnalyticsOptIn, writeAnalyticsOptIn } from '@/lib/analytics-opt-in';
import { readCookieConsent } from '@/lib/cookie-consent';

/** Masqué sur `/` — accueil plein écran. */
export function AnalyticsOptInBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function syncVisibility() {
      const cookiesAccepted = readCookieConsent() != null;
      const analyticsChoice = readAnalyticsOptIn();
      setVisible(cookiesAccepted && analyticsChoice == null);
    }

    syncVisibility();
    window.addEventListener('storage', syncVisibility);
    window.addEventListener('ama:cookie-consent', syncVisibility);

    return () => {
      window.removeEventListener('storage', syncVisibility);
      window.removeEventListener('ama:cookie-consent', syncVisibility);
    };
  }, []);

  function choose(value: 'accepted' | 'declined') {
    writeAnalyticsOptIn(value);
    setVisible(false);
  }

  if (pathname === '/' || !visible) return null;

  return (
    <div
      className="analytics-opt-in-banner"
      role="dialog"
      aria-labelledby="analytics-opt-in-title"
      aria-describedby="analytics-opt-in-desc"
    >
      <div className="analytics-opt-in-banner__inner container">
        <div className="analytics-opt-in-banner__copy">
          <p id="analytics-opt-in-title" className="analytics-opt-in-banner__title">
            Mesure d&apos;audience (optionnelle)
          </p>
          <p id="analytics-opt-in-desc" className="analytics-opt-in-banner__text">
            Aucun tracking tiers pour l&apos;instant. Vous pouvez enregistrer votre préférence pour de futurs outils
            d&apos;analyse respectueux du RGPD.
          </p>
        </div>
        <div className="analytics-opt-in-banner__actions">
          <Link href="/legal/confidentialite" className="analytics-opt-in-banner__link">
            Confidentialité
          </Link>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => choose('declined')}>
            Refuser
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => choose('accepted')}>
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
