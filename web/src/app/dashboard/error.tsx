'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <section style={{ padding: '3rem 0', minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          maxWidth: 500,
          width: '100%',
        }}
      >
        <span style={{ fontSize: '2rem' }} aria-hidden>📊</span>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.65rem' }}>
          Tableau de bord indisponible
        </h1>
        <p className="muted" style={{ marginTop: '0.5rem', lineHeight: 1.6, fontSize: '0.93rem' }}>
          Impossible de charger tes données de progression. Vérifie ta connexion et réessaie.
        </p>
        {error.digest && (
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.78rem', fontFamily: 'monospace' }}>
            Ref : {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <Button onClick={reset} size="sm">Réessayer</Button>
          <Button href="/courses" variant="secondary" size="sm">Voir les parcours</Button>
          <Button href="/diagnostics" variant="ghost" size="sm">Diagnostics</Button>
        </div>
      </div>
    </section>
  );
}
