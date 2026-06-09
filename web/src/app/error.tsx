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
    <section style={{ padding: '2rem 0' }}>
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          maxWidth: 560,
        }}
      >
        <span style={{ fontSize: '2rem' }} aria-hidden>⚠️</span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.75rem' }}>
          Une erreur est survenue
        </h1>
        <p className="muted" style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
          Un problème inattendu s&apos;est produit. Réessaie ou reviens à l&apos;accueil.
        </p>
        {error.digest && (
          <p
            className="muted"
            style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
          >
            Code : {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <Button onClick={reset} variant="primary" size="sm">
            Réessayer
          </Button>
          <Button href="/" variant="secondary" size="sm">
            Retour à l&apos;accueil
          </Button>
          <Button href="/courses" variant="ghost" size="sm">
            Voir les parcours
          </Button>
        </div>
      </div>
    </section>
  );
}
