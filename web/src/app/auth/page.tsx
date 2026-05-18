'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { login, register } from '@/lib/api';
import { getAccessToken, logoutSession, storeAuthTokens } from '@/lib/auth';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
      router.push('/dashboard');
    } catch {
      setError(
        mode === 'login'
          ? 'Connexion impossible. Vérifie tes identifiants ou le backend.'
          : 'Inscription impossible. Cet email existe peut-être déjà.'
      );
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
    <section style={{ padding: '2rem 0', maxWidth: 620 }}>
      <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Compte local MVP</p>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
        {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
      </h1>
      <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>
        Utilise une connexion locale simple pour débloquer le tableau de bord et les parcours.
      </p>

      {hasSession && (
        <div className="card" style={{ background: '#eef6ff', borderColor: '#85bfff', marginTop: '1.5rem' }}>
          <strong>Session active dans ce navigateur</strong>
          <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
            Tu peux continuer vers le dashboard ou te déconnecter proprement avant de changer de compte.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
            <Link className="btn" href="/dashboard">
              Ouvrir le dashboard
            </Link>
            <button className="btn" type="button" onClick={handleLogout} disabled={isSubmitting} style={{ background: '#1d1d1f' }}>
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn" type="button" onClick={() => setMode('login')} disabled={mode === 'login'}>
          Connexion
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => setMode('register')}
          disabled={mode === 'register'}
          style={{ background: '#1d1d1f' }}
        >
          Inscription
        </button>
      </div>

      <form className="card" onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
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

        {error && <p style={{ color: '#b00020', fontWeight: 600 }}>{error}</p>}

        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Envoi...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </form>

      <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>
        Tu peux aussi explorer les <Link href="/courses">parcours en mode démo</Link>.
      </p>
    </section>
  );
}

const inputStyle = {
  border: '1px solid var(--border)',
  borderRadius: 10,
  font: 'inherit',
  padding: '0.75rem 0.9rem',
};
