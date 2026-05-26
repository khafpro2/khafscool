'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/api';
import { sanitizeRedirectPath, storeAuthenticatedUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function OAuthCompletePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionCode = params.get('sessionCode');
    const next = sanitizeRedirectPath(params.get('next')) ?? '/dashboard';

    if (!sessionCode) {
      setError('Connexion OAuth incomplète. Réessaie depuis la page de connexion.');
      return;
    }

    void (async () => {
      try {
        const res = await fetch('/api/auth/oauth-exchange', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionCode }),
          cache: 'no-store',
        });

        if (!res.ok) {
          setError('Code de session OAuth invalide ou expiré.');
          return;
        }

        const data = (await res.json()) as { user?: AuthUser };
        if (data.user) {
          storeAuthenticatedUser(data.user);
        }

        window.history.replaceState({}, '', '/auth/oauth-complete');
        router.replace(next);
      } catch {
        setError('Impossible de finaliser la connexion OAuth.');
      }
    })();
  }, [router]);

  if (error) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <Card>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Connexion OAuth</h1>
          <p style={{ marginTop: '0.75rem', color: '#b42318', fontWeight: 600 }}>{error}</p>
          <Button href="/auth" style={{ marginTop: '1rem' }}>
            Retour à la connexion
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section style={{ padding: '2rem 0' }}>
      <p className="muted">Finalisation de la connexion…</p>
    </section>
  );
}
