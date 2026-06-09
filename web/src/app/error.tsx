'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <section style={{ padding: '3rem 0', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          maxWidth: 520,
          width: '100%',
        }}
      >
        <span style={{ fontSize: '2.5rem', lineHeight: 1 }} aria-hidden>⚠️</span>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.75rem', lineHeight: 1.2 }}>
          Une erreur est survenue
        </h1>

        <p className="muted" style={{ marginTop: '0.65rem', lineHeight: 1.65, fontSize: '0.95rem' }}>
          Un problème inattendu s&apos;est produit. Tu peux réessayer ou retourner à l&apos;accueil.
        </p>

        {error.digest && (
          <p
            className="muted"
            style={{
              marginTop: '0.75rem',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              background: 'var(--bg-soft)',
              padding: '0.4rem 0.65rem',
              borderRadius: 6,
              display: 'inline-block',
            }}
          >
            Référence : {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Button onClick={reset} size="sm">
            Réessayer
          </Button>
          <Button href="/" variant="secondary" size="sm">
            Accueil
          </Button>
          <Button href="/courses" variant="ghost" size="sm">
            Parcours
          </Button>
          <Button href="/diagnostics" variant="ghost" size="sm">
            Statut des services
          </Button>
        </div>
      </div>
    </section>
  );
}
