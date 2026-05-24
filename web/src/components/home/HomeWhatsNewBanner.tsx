'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { dismissWhatsNewBanner, isWhatsNewBannerDismissed } from '@/lib/whats-new-banner';

export function HomeWhatsNewBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!isWhatsNewBannerDismissed());
  }, []);

  function handleDismiss() {
    dismissWhatsNewBanner();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="container"
      style={{ marginTop: '1rem' }}
      data-testid="home-whats-new-banner"
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.65rem 1rem',
          padding: '0.65rem 1rem',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--surface-soft, #f8fafc)',
          fontSize: '0.92rem',
        }}
      >
        <span
          style={{
            background: 'var(--gradient-accent)',
            color: '#fff',
            borderRadius: 999,
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.15rem 0.55rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Nouveau · v0.2.1
        </span>
        <span className="muted" style={{ flex: '1 1 220px' }}>
          Examen blanc (pool 44 Q),{' '}
          <Link href="/resources/glossaire" style={{ fontWeight: 700 }}>
            glossaire MDM
          </Link>{' '}
          et dons en 3 modes (carte, PayPal, virement).
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleDismiss}
          data-testid="home-whats-new-dismiss"
          aria-label="Masquer cette annonce"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
