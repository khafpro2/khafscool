'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
          padding: '1rem',
          background: '#f8fafc',
          color: '#0f172a',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Erreur critique
          </h1>
          <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            MDM Academy a rencontré une erreur inattendue.
            {error.digest && ` (${error.digest})`}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Réessayer
            </button>
            <a
              href="/"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
