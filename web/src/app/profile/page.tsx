'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { DashboardData } from '@/lib/api';
import { fetchCurrentUser, fetchDashboard, updateDisplayName, changePassword } from '@/lib/api';
import { buildAuthUrl, getAccessToken, getStoredUser, logoutAllDevices, logoutSession, updateStoredUserDisplayName } from '@/lib/auth';
import { resolveApiErrorMessage } from '@/lib/auth-errors';
import { showToast } from '@/lib/toast-store';
import { formatTrack } from '@/lib/tracks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProfilePageSkeleton } from '@/components/ui/Skeleton';
import { RecentActivitySection } from '@/components/profile/RecentActivitySection';
import { TrailCard } from '@/components/ui/TrailCard';
import {
  estimatePoints,
  getBadgeVisual,
  getRankInfo,
  inferLevelFromModules,
} from '@/lib/design';

export default function ProfilePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fromApi, setFromApi] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [displayNameOverride, setDisplayNameOverride] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    setHasToken(Boolean(token));

    if (!token) {
      fetchDashboard()
        .then((dashboard) => {
          setData(dashboard);
          setFromApi(false);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    Promise.all([fetchDashboard(token), fetchCurrentUser(token)])
      .then(([dashboard]) => {
        setData(dashboard);
        setFromApi(true);
      })
      .catch(() => {
        fetchDashboard(token).then((dashboard) => {
          setData(dashboard);
          setFromApi(false);
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleLogout() {
    await logoutSession();
    setHasToken(false);
    setFromApi(false);
    const demo = await fetchDashboard();
    setData(demo);
  }

  const storedUser = useMemo(() => (typeof window !== 'undefined' ? getStoredUser() : null), [hasToken]);

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!data) {
    return (
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Mon profil</h1>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Impossible de charger le profil. Réessaie ou reconnecte-toi.
        </p>
        <Button href={buildAuthUrl('/profile')} style={{ marginTop: '1rem' }}>
          Se connecter
        </Button>
      </section>
    );
  }

  const { user, stats, badges, courses, completedCourses = [], recentActivity = [] } = data;
  const displayName =
    displayNameOverride ?? user.displayName ?? storedUser?.displayName ?? 'Apprenant';
  const email = user.email ?? storedUser?.email ?? 'demo@ama.dev';
  const rank = getRankInfo(stats.points);
  const previousFloor = rank.minPoints;
  const ceiling = rank.nextPoints ?? Math.max(previousFloor + 100, stats.points + 100);
  const span = Math.max(1, ceiling - previousFloor);
  const progressInRank = Math.max(0, Math.min(span, stats.points - previousFloor));
  const rankPercent = Math.round((progressInRank / span) * 100);
  const remainingPoints = rank.nextPoints != null ? Math.max(0, rank.nextPoints - stats.points) : 0;
  const recentBadges = badges.slice(0, 6);

  return (
    <section style={{ padding: '1rem 0 2rem' }}>
      {!hasToken ? (
        <Card
          style={{
            marginBottom: '1.25rem',
            background: '#fff8e6',
            borderColor: '#f0cf7a',
          }}
        >
          <p style={{ margin: 0, color: '#8a5a00', fontWeight: 700 }}>
            Profil en mode démo — connecte-toi pour synchroniser ton compte réel.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
            <Button href={buildAuthUrl('/profile')} size="sm">
              Se connecter ou s&apos;inscrire
            </Button>
            <Button href="/dashboard" variant="ghost" size="sm">
              Mon apprentissage
            </Button>
          </div>
        </Card>
      ) : hasToken && !fromApi ? (
        <Card
          style={{
            marginBottom: '1.25rem',
            background: '#fff8e6',
            borderColor: '#f0cf7a',
          }}
        >
          <p style={{ margin: 0, color: '#8a5a00', fontWeight: 700 }}>
            API indisponible — affichage des données de démonstration.
          </p>
        </Card>
      ) : null}

      <ProfileHero
        displayName={displayName}
        email={email}
        rank={rank}
        level={stats.level}
        points={stats.points}
        rankPercent={rankPercent}
        remainingPoints={remainingPoints}
        hasToken={hasToken}
        onLogout={handleLogout}
      />

      <AccountDetailsCard
        displayName={displayName}
        email={email}
        rankName={rank.name}
        level={stats.level}
        points={stats.points}
        provider={user.provider ?? storedUser?.provider}
        hasToken={hasToken}
        canEdit={hasToken && fromApi}
        onDisplayNameSaved={(nextName) => {
          setDisplayNameOverride(nextName);
          setData((current) =>
            current ? { ...current, user: { ...current.user, displayName: nextName } } : current
          );
        }}
      />

      {hasToken && fromApi ? (
        <SecuritySection
          provider={user.provider ?? storedUser?.provider}
          onLogoutAll={async () => {
            await logoutAllDevices();
            setHasToken(false);
            setFromApi(false);
            const demo = await fetchDashboard();
            setData(demo);
            showToast({
              kind: 'success',
              title: 'Sessions fermées',
              body: 'Tous tes appareils ont été déconnectés.',
            });
          }}
        />
      ) : null}

      <QuickLinksCard />

      <RecentActivitySection items={recentActivity} />

      {recentBadges.length > 0 ? (
        <Card style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Badges débloqués</h2>
            <Link href="/badges" style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              Collection →
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {recentBadges.map((slug) => {
              const visual = getBadgeVisual(slug);
              return (
                <Badge
                  key={slug}
                  brand={visual.brand}
                  style={{ background: visual.bg, color: visual.color, border: `1px solid ${visual.color}22` }}
                  tone="accent"
                >
                  {visual.label}
                </Badge>
              );
            })}
          </div>
        </Card>
      ) : null}

      {completedCourses.length > 0 ? (
        <section className="section profile-certificates" style={{ marginTop: '1.5rem' }}>
          <div className="section-head">
            <div>
              <span className="section-eyebrow">Certificats</span>
              <h2>Parcours terminés</h2>
            </div>
            <Link href="/badges" style={{ fontWeight: 700 }}>
              Badges →
            </Link>
          </div>
          <div className="grid grid-cards-lg">
            {completedCourses.map((course) => {
              const level = inferLevelFromModules(
                courses.find((item) => item.slug === course.slug)?.totalModules
              );
              const points = estimatePoints(
                courses.find((item) => item.slug === course.slug)?.totalModules,
                level
              );
              return (
                <TrailCard
                  key={course.slug}
                  href={`/courses/${course.slug}/certificate`}
                  title={course.title}
                  track={course.track}
                  trackLabel={formatTrack(course.track)}
                  progressPercent={100}
                  level={level}
                  points={points}
                  cta="Voir le certificat"
                  status="completed"
                />
              );
            })}
          </div>
        </section>
      ) : (
        <Card variant="soft" className="profile-certificates-empty" style={{ marginTop: '1.25rem' }}>
          <span className="section-eyebrow">Certificats</span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.35rem' }}>Aucun certificat pour l&apos;instant</h2>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Termine les 3 unités d&apos;un parcours pour débloquer ton certificat de complétion imprimable.
          </p>
          <Button href="/dashboard" style={{ marginTop: '0.85rem' }}>
            Reprendre l&apos;apprentissage
          </Button>
        </Card>
      )}
    </section>
  );
}

function ProfileHero({
  displayName,
  email,
  rank,
  level,
  points,
  rankPercent,
  remainingPoints,
  hasToken,
  onLogout,
}: {
  displayName: string;
  email: string;
  rank: ReturnType<typeof getRankInfo>;
  level: string;
  points: number;
  rankPercent: number;
  remainingPoints: number;
  hasToken: boolean;
  onLogout: () => void;
}) {
  const initials = getInitials(displayName, email);

  return (
    <Card
      style={{
        background: rank.gradient,
        color: '#fff',
        borderColor: 'transparent',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          {initials}
        </div>
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.32)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span aria-hidden>{rank.icon}</span> Compte apprenant
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{displayName}</h1>
          <p style={{ marginTop: '0.25rem', color: 'rgba(255,255,255,0.88)', fontSize: '0.95rem' }}>{email}</p>
          <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.92)' }}>
            Rang <strong style={{ color: '#fff' }}>{rank.name}</strong> · niveau{' '}
            <strong style={{ color: '#fff' }}>{level}</strong> · {points} points
          </p>
          <div style={{ marginTop: '1rem', maxWidth: 560 }}>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={rankPercent}
              style={{
                background: 'rgba(255,255,255,0.22)',
                borderRadius: 999,
                height: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(90deg, #ffffff 0%, #ffce5b 100%)',
                  height: '100%',
                  width: `${rankPercent}%`,
                  borderRadius: 999,
                }}
              />
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.92)' }}>
              {rank.nextName
                ? `${remainingPoints} pts pour le rang ${rank.nextName}`
                : 'Rang maximal atteint — bravo Champion·ne !'}
            </p>
          </div>
        </div>
        {hasToken ? (
          <button
            type="button"
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', borderColor: 'rgba(255,255,255,0.32)' }}
          >
            Déconnexion
          </button>
        ) : (
          <Button
            href={buildAuthUrl('/profile')}
            variant="secondary"
            size="sm"
            style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', borderColor: 'rgba(255,255,255,0.32)' }}
          >
            Connexion
          </Button>
        )}
      </div>
    </Card>
  );
}

function AccountDetailsCard({
  displayName,
  email,
  rankName,
  level,
  points,
  provider,
  hasToken,
  canEdit,
  onDisplayNameSaved,
}: {
  displayName: string;
  email: string;
  rankName: string;
  level: string;
  points: number;
  provider?: string;
  hasToken: boolean;
  canEdit?: boolean;
  onDisplayNameSaved?: (displayName: string) => void;
}) {
  const memberSince = hasToken ? 'Synchronisé avec ton compte' : 'Mode démo local';

  return (
    <Card style={{ marginTop: '1.25rem' }}>
      <span className="section-eyebrow">Informations du compte</span>
      <dl
        style={{
          display: 'grid',
          gap: '0.85rem',
          marginTop: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {canEdit ? (
          <DisplayNameField initialValue={displayName} onSaved={onDisplayNameSaved} />
        ) : (
          <AccountField label="Nom affiché" value={displayName} />
        )}
        <AccountField label="E-mail" value={email} />
        <AccountField label="Rang MDM" value={rankName} />
        <AccountField label="Niveau" value={level} />
        <AccountField label="Points cumulés" value={String(points)} />
        <AccountField label="Inscription" value={memberSince} />
        {provider ? <AccountField label="Connexion" value={formatProvider(provider)} /> : null}
      </dl>
    </Card>
  );
}

function DisplayNameField({
  initialValue,
  onSaved,
}: {
  initialValue: string;
  onSaved?: (displayName: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError('Le nom d\'affichage est requis');
      return;
    }
    if (trimmed.length > 100) {
      setError('Le nom d\'affichage ne peut pas dépasser 100 caractères');
      return;
    }
    if (trimmed === initialValue.trim()) {
      setError(null);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Connecte-toi pour modifier ton nom');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const user = await updateDisplayName(token, trimmed);
      updateStoredUserDisplayName(user.displayName ?? trimmed);
      onSaved?.(user.displayName ?? trimmed);
      showToast({
        kind: 'success',
        title: 'Nom mis à jour',
        body: 'Ton nom affiché a été enregistré.',
      });
    } catch {
      setError('Impossible d\'enregistrer le nom. Réessaie dans un instant.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem' }}>
        <label htmlFor="profile-display-name" className="muted" style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Nom affiché
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <input
            id="profile-display-name"
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            maxLength={100}
            autoComplete="nickname"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'profile-display-name-error' : undefined}
            style={{
              flex: '1 1 220px',
              minWidth: 0,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${error ? '#dc2626' : 'var(--border)'}`,
              background: 'var(--surface)',
              color: 'var(--fg)',
              fontWeight: 600,
            }}
          />
          <button type="submit" className="btn btn-sm" disabled={isSaving}>
            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
        {error ? (
          <p id="profile-display-name-error" role="alert" style={{ margin: 0, color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>
            {error}
          </p>
        ) : (
          <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
            Visible sur ton profil, le classement et les certificats.
          </p>
        )}
      </form>
    </div>
  );
}

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="muted" style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </dt>
      <dd style={{ marginTop: '0.25rem', fontWeight: 700 }}>{value}</dd>
    </div>
  );
}

function SecuritySection({
  provider,
  onLogoutAll,
}: {
  provider?: string;
  onLogoutAll: () => Promise<void>;
}) {
  const isLocalAccount = !provider || provider === 'LOCAL' || provider === 'EMAIL';
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  async function handleLogoutAll() {
    setIsLoggingOutAll(true);
    try {
      await onLogoutAll();
    } finally {
      setIsLoggingOutAll(false);
    }
  }

  return (
    <Card style={{ marginTop: '1.25rem' }}>
      <span className="section-eyebrow">Sécurité</span>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.35rem' }}>Compte et sessions</h2>

      {isLocalAccount ? (
        <PasswordChangeForm />
      ) : (
        <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Connexion via {formatProvider(provider ?? '')} — le mot de passe se gère depuis ce fournisseur.
        </p>
      )}

      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontWeight: 700 }}>Déconnecter tous les appareils</p>
        <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
          Révoque toutes les sessions actives (web, mobile, autres navigateurs).
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '0.75rem' }}
          disabled={isLoggingOutAll}
          onClick={() => void handleLogoutAll()}
        >
          {isLoggingOutAll ? 'Déconnexion…' : 'Déconnecter tous les appareils'}
        </button>
      </div>
    </Card>
  );
}

function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!currentPassword.trim()) {
      setError('Indique ton mot de passe actuel.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Connecte-toi pour modifier ton mot de passe.');
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast({
        kind: 'success',
        title: 'Mot de passe mis à jour',
        body: 'Utilise ton nouveau mot de passe lors de ta prochaine connexion.',
      });
    } catch (caught) {
      setError(resolveApiErrorMessage(caught, 'password'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
      <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
        Modifie ton mot de passe de connexion e-mail.
      </p>
      <label htmlFor="profile-current-password" className="muted" style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Mot de passe actuel
      </label>
      <input
        id="profile-current-password"
        type="password"
        value={currentPassword}
        onChange={(event) => {
          setCurrentPassword(event.target.value);
          if (error) setError(null);
        }}
        autoComplete="current-password"
        aria-invalid={Boolean(error)}
        style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? '#dc2626' : 'var(--border)'}`,
          background: 'var(--surface)',
          color: 'var(--fg)',
        }}
      />
      <label htmlFor="profile-new-password" className="muted" style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Nouveau mot de passe
      </label>
      <input
        id="profile-new-password"
        type="password"
        value={newPassword}
        onChange={(event) => {
          setNewPassword(event.target.value);
          if (error) setError(null);
        }}
        autoComplete="new-password"
        minLength={8}
        style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--fg)',
        }}
      />
      <label htmlFor="profile-confirm-password" className="muted" style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Confirmer le nouveau mot de passe
      </label>
      <input
        id="profile-confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          if (error) setError(null);
        }}
        autoComplete="new-password"
        minLength={8}
        style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--fg)',
        }}
      />
      {error ? (
        <p role="alert" style={{ margin: 0, color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-sm" disabled={isSaving} style={{ justifySelf: 'start' }}>
        {isSaving ? 'Enregistrement…' : 'Changer le mot de passe'}
      </button>
    </form>
  );
}

function QuickLinksCard() {
  const links = [
    { href: '/dashboard', label: 'Mon apprentissage', description: 'Progression, quêtes et prochaine unité' },
    { href: '/badges', label: 'Mes badges', description: 'Collection et super-badges par piste' },
    { href: '/quests', label: 'Quêtes hebdo', description: 'Défis bonus de la semaine' },
    { href: '/leaderboard', label: 'Classement', description: 'Compare ta progression à la communauté' },
  ];

  return (
    <section className="section" style={{ marginTop: '1.5rem' }}>
      <div className="section-head">
        <div>
          <span className="section-eyebrow">Raccourcis</span>
          <h2>Liens rapides</h2>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="card card-soft"
            style={{ display: 'grid', gap: '0.35rem', color: 'inherit' }}
          >
            <strong>{link.label}</strong>
            <span className="muted" style={{ fontSize: '0.9rem' }}>
              {link.description}
            </span>
          </Link>
        ))}
        <div
          className="card card-soft"
          style={{ display: 'grid', gap: '0.35rem', opacity: 0.72 }}
          aria-disabled
        >
          <strong>Paramètres</strong>
          <span className="muted" style={{ fontSize: '0.9rem' }}>
            Notifications et préférences — bientôt disponible
          </span>
        </div>
      </div>
    </section>
  );
}

function formatProvider(provider: string) {
  const map: Record<string, string> = {
    EMAIL: 'E-mail',
    APPLE: 'Apple',
    GOOGLE: 'Google',
    MICROSOFT: 'Microsoft',
  };
  return map[provider] ?? provider;
}

function getInitials(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed && trimmed !== 'Apprenant' && trimmed !== 'Technicien démo') {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.includes('@')) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'AP';
}
