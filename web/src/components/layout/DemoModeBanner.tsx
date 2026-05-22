'use client';

import { useSyncExternalStore } from 'react';
import { getAccessToken } from '@/lib/auth';
import { isDemoModeActive, subscribeDemoMode } from '@/lib/demo-mode-store';

function subscribeDemoBanner(listener: () => void) {
  const unsubscribeDemo = subscribeDemoMode(listener);
  const onStorage = () => listener();
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    unsubscribeDemo();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function useDemoBannerState() {
  const demoMode = useSyncExternalStore(subscribeDemoBanner, () => isDemoModeActive(), () => false);
  const hasToken = useSyncExternalStore(subscribeDemoBanner, () => Boolean(getAccessToken()), () => false);
  return { demoMode, hasToken };
}

export function DemoModeBanner() {
  const { demoMode, hasToken } = useDemoBannerState();

  if (demoMode) {
    return (
      <div
        role="status"
        className="demo-mode-banner"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'linear-gradient(90deg, #fff7d6 0%, #fef3c7 100%)',
          borderBottom: '1px solid #f0cf7a',
          color: '#6b5200',
          fontSize: '0.85rem',
          fontWeight: 600,
          textAlign: 'center',
          padding: '0.45rem 1rem',
        }}
      >
        Mode démo local — données locales
        {hasToken ? ' (API indisponible malgré ta session)' : ' (sans compte ni synchronisation)'}
      </div>
    );
  }

  if (!hasToken) return null;

  return (
    <div
      role="status"
      className="demo-mode-banner demo-mode-banner-connected"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'linear-gradient(90deg, #ecfdf5 0%, #d1fae5 100%)',
        borderBottom: '1px solid #6ee7b7',
        color: '#065f46',
        fontSize: '0.85rem',
        fontWeight: 600,
        textAlign: 'center',
        padding: '0.45rem 1rem',
      }}
    >
      Connecté à l&apos;API — progression synchronisée avec ton compte
    </div>
  );
}
