'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { readCookieConsent, writeCookieConsent } from '@/lib/cookie-consent';

/** Masqué sur `/` — accueil plein écran ; consentement sur les autres pages. */
export function CookieConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readCookieConsent() == null);
  }, []);

  function accept() {
    writeCookieConsent();
    setVisible(false);
    window.dispatchEvent(new Event('ama:cookie-consent'));
  }

  if (pathname === '/' || !visible) return null;

  return (
    <div
      className="cookie-consent-banner"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="cookie-consent-banner__inner container">
        <div className="cookie-consent-banner__copy">
          <p id="cookie-consent-title" className="cookie-consent-banner__title">
            Cookies et stockage local
          </p>
          <p id="cookie-consent-desc" className="cookie-consent-banner__text">
            MDM Academy utilise uniquement le stockage local de votre navigateur pour la session, le thème et la
            progression pédagogique. Aucun traceur publicitaire tiers n'est employé.
          </p>
        </div>
        <div className="cookie-consent-banner__actions">
          <Link href="/legal/confidentialite" className="cookie-consent-banner__link">
            En savoir plus
          </Link>
          <button type="button" className="btn btn-primary btn-sm" onClick={accept}>
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
