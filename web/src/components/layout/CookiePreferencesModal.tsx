'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  COOKIE_PREFERENCES_OPEN_EVENT,
  writeCookieConsent,
} from '@/lib/cookie-consent';

export function CookiePreferencesModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_PREFERENCES_OPEN_EVENT, onOpen);
  }, []);

  function accept() {
    writeCookieConsent();
    setOpen(false);
    window.dispatchEvent(new Event('ama:cookie-consent'));
  }

  if (!open) return null;

  return (
    <div
      className="cookie-preferences-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
      aria-describedby="cookie-preferences-desc"
    >
      <button
        type="button"
        className="cookie-preferences-modal__backdrop"
        aria-label="Fermer les préférences cookies"
        onClick={() => setOpen(false)}
      />
      <div className="cookie-preferences-modal__panel">
        <p id="cookie-preferences-title" className="cookie-preferences-modal__title">
          Cookies et stockage local
        </p>
        <p id="cookie-preferences-desc" className="cookie-preferences-modal__text">
          MDM Academy utilise uniquement le stockage local de votre navigateur pour la session, le thème et la
          progression pédagogique. Aucun traceur publicitaire tiers n&apos;est employé.
        </p>
        <div className="cookie-preferences-modal__actions">
          <Link href="/legal/confidentialite" className="cookie-preferences-modal__link">
            En savoir plus
          </Link>
          <button type="button" className="btn btn-primary btn-sm" onClick={accept}>
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
