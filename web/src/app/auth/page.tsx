'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, login, register } from '@/lib/api';
import {
  getAccessToken,
  logoutSession,
  sanitizeRedirectPath,
  storeAuthTokens,
} from '@/lib/auth';
import { resolveAuthErrorMessage } from '@/lib/auth-errors';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BrandIcon } from '@/components/ui/BrandIcon';
import type { BrandId } from '@/lib/brands';

const SSO_PROVIDERS: {
  id: string;
  label: string;
  brand?: BrandId;
  icon?: string;
  variant: 'dark' | 'secondary' | 'primary';
}[] = [
  { id: 'apple', label: 'Continuer avec Apple', brand: 'apple', variant: 'dark' },
  { id: 'google', label: 'Continuer avec Google', icon: 'G', variant: 'secondary' },
  { id: 'microsoft', label: 'Continuer avec Microsoft', brand: 'microsoft', variant: 'primary' },
];

const inputStyle = {
  border: '1px solid var(--border)',
  borderRadius: 12,
  font: 'inherit',
  padding: '0.8rem 1rem',
  width: '100%',
  background: '#fff',
} as const;

function readRedirectFromLocation(): string {
  if (typeof window === 'undefined') return '/dashboard';
  const value = new URLSearchParams(window.location.search).get('redirect');
  return sanitizeRedirectPath(value) ?? '/dashboard';
}

export default function AuthPage() {
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRedirectPath(readRedirectFromLocation());
    setHasSession(Boolean(getAccessToken()));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const auth =
        mode === 'login'
          ? await login(email, password)
          : await register(email, password, displayName || email.split('@')[0]);
      storeAuthTokens(auth);
      setHasSession(true);
      router.push(redirectPath);
    } catch (error) {
      setError(resolveAuthErrorMessage(error, mode));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    await logoutSession();
    setHasSession(false);
    setIsSubmitting(false);
  }

  return (
    <section className="auth-shell" style={{ padding: '1rem 0 2.5rem' }}>
      <div className="hero auth-hero-compact">
        <span className="hero-eyebrow">Accès gratuit</span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>Connecte-toi en quelques secondes</h1>
        <p style={{ marginTop: '0.65rem', maxWidth: 520 }}>
          Tous les parcours Apple, Jamf et Intune sont gratuits. Crée un compte pour sauvegarder ta progression,
          tes badges et tes quêtes.
        </p>
      </div>

      {hasSession && (
        <Card variant="soft" className="auth-card-glass" style={{ borderColor: '#93c5fd', marginBottom: '1.25rem' }}>
          <Badge tone="success" icon="\u2705">
            Session active
          </Badge>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Tu es connecté dans ce navigateur. Continue vers ta destination ou déconnecte-toi pour changer de compte.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
            <Button href={redirectPath}>Continuer</Button>
            <Button variant="dark" type="button" onClick={handleLogout} disabled={isSubmitting}>
              Se déconnecter
            </Button>
          </div>
        </Card>
      )}

      <div
        style={{
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
          alignItems: 'start',
        }}
      >
        <Card as="article" className="auth-card-glass">
          <p className="section-eyebrow">Compte gratuit</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <Button
              type="button"
              size="sm"
              variant={mode === 'login' ? 'primary' : 'ghost'}
              onClick={() => setMode('login')}
            >
              Connexion
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'register' ? 'primary' : 'ghost'}
              onClick={() => setMode('register')}
            >
              Inscription
            </Button>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '1rem' }}>
            {mode === 'login' ? 'Se connecter par email' : 'Créer un compte gratuit'}
          </h2>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {mode === 'login'
              ? 'Utilise les identifiants créés localement après le seed ou une inscription.'
              : 'Aucune carte bancaire — accès immédiat au catalogue complet.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
            {mode === 'register' && (
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600 }}>
                Nom affiché
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Technicien Apple"
                  style={inputStyle}
                />
              </label>
            )}
            <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600 }}>
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tech@example.com"
                style={inputStyle}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600 }}>
              Mot de passe
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="8 caractères minimum"
                style={inputStyle}
              />
            </label>

            {error && (
              <p
                role="alert"
                style={{
                  color: '#b42318',
                  fontWeight: 600,
                  background: '#fee4e2',
                  padding: '0.75rem',
                  borderRadius: 12,
                }}
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} fullWidth size="lg">
              {isSubmitting ? 'Envoi en cours…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte gratuit'}
            </Button>
          </form>
        </Card>

        <aside style={{ display: 'grid', gap: '1rem' }}>
          <Card variant="soft" className="auth-card-glass">
            <p className="section-eyebrow">Connexion rapide (dev)</p>
            <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
              En développement, les fournisseurs OAuth simulent un profil sans appeler les API réelles.
            </p>
            <div style={{ display: 'grid', gap: '0.6rem', marginTop: '0.85rem' }}>
              {SSO_PROVIDERS.map((provider) => (
                <Button
                  key={provider.id}
                  href={`${API_URL}/auth/${provider.id}/start?redirect=${encodeURIComponent(redirectPath)}`}
                  variant={provider.variant}
                  fullWidth
                  icon={provider.brand ? undefined : provider.icon}
                  style={
                    provider.brand
                      ? { display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }
                      : undefined
                  }
                >
                  {provider.brand ? (
                    <BrandIcon
                      brand={provider.brand}
                      size="sm"
                      variant={provider.variant === 'dark' ? 'onColor' : 'default'}
                    />
                  ) : null}
                  {provider.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="auth-card-glass">
            <p className="section-eyebrow">Sans compte ?</p>
            <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Explore les parcours Apple, Jamf et Intune en mode démo depuis le catalogue public.
            </p>
            <Button href="/courses" variant="secondary" size="sm" style={{ marginTop: '0.75rem' }}>
              Voir les parcours gratuits
            </Button>
          </Card>
        </aside>
      </div>
    </section>
  );
}
