'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { getAuthTokenPresence } from '@/lib/auth';

type CheckStatus = 'pending' | 'ok' | 'error' | 'warning';

type EndpointCheck = {
  detail: string;
  status: CheckStatus;
};

const quickLinks = [
  { href: '/auth', label: 'Auth' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/courses', label: 'Parcours' },
  { href: '/servicenow', label: 'ServiceNow' },
  { href: '/sprint', label: 'Sprint' },
  { href: '/mvp', label: 'MVP' },
];

const initialEndpointCheck: EndpointCheck = {
  detail: 'Vérification en cours...',
  status: 'pending',
};

export default function DiagnosticsPage() {
  const [healthCheck, setHealthCheck] = useState<EndpointCheck>(initialEndpointCheck);
  const [databaseCheck, setDatabaseCheck] = useState<EndpointCheck>(initialEndpointCheck);
  const [catalogCheck, setCatalogCheck] = useState<EndpointCheck>(initialEndpointCheck);
  const [tokenPresence, setTokenPresence] = useState(() => ({
    accessTokenCookie: false,
    accessTokenLocal: false,
    refreshTokenCookie: false,
    refreshTokenLocal: false,
  }));

  useEffect(() => {
    setTokenPresence(getAuthTokenPresence());
    void runEndpointChecks();
  }, []);

  async function runEndpointChecks() {
    const [health, database, catalog] = await Promise.all([checkHealth(), checkDatabase(), checkCatalog()]);
    setHealthCheck(health);
    setDatabaseCheck(database);
    setCatalogCheck(catalog);
  }

  const hasAnyToken = Object.values(tokenPresence).some(Boolean);
  const hasAccessToken = tokenPresence.accessTokenCookie || tokenPresence.accessTokenLocal;
  const hasRefreshToken = tokenPresence.refreshTokenCookie || tokenPresence.refreshTokenLocal;

  return (
    <section style={{ padding: '2rem 0' }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eef6ff 58%, #fff8e6 100%)',
          padding: '1.75rem',
        }}
      >
        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
          Diagnostics navigateur
        </p>
        <h1 style={{ fontSize: '2.35rem', fontWeight: 800, lineHeight: 1.12, marginTop: '0.35rem' }}>
          Vérifier rapidement le MVP local
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '0.85rem', maxWidth: 820 }}>
          Cette page aide les développeurs et testeurs à confirmer l’état de l’API, de la base Prisma, du catalogue
          et de la session locale depuis le navigateur, sans afficher de token ni de secret.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button className="btn" type="button" onClick={runEndpointChecks}>
            Relancer les vérifications
          </button>
          <Link className="btn" href="/auth" style={{ background: '#1d1d1f' }}>
            Tester la connexion
          </Link>
        </div>
      </div>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          marginTop: '1.5rem',
        }}
      >
        <StatusCard
          detail={healthCheck.detail}
          label="API /health"
          status={healthCheck.status}
          title="Santé de l’API"
        />
        <StatusCard
          detail={databaseCheck.detail}
          label="API /health/db"
          status={databaseCheck.status}
          title="Base de données Prisma"
        />
        <StatusCard
          detail={catalogCheck.detail}
          label="API /catalog"
          status={catalogCheck.status}
          title="Catalogue public"
        />
        <StatusCard
          detail={
            hasAnyToken
              ? 'Présence détectée en stockage local ou cookie. Les valeurs restent masquées.'
              : 'Aucun token local ou cookie détecté dans ce navigateur.'
          }
          label="Session locale"
          status={hasAccessToken && hasRefreshToken ? 'ok' : hasAnyToken ? 'warning' : 'error'}
          title="Tokens navigateur"
        />
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Conseils DB/API locale</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          Si la carte base de données reste en erreur, vérifie ces points sans partager la valeur de tes variables
          d’environnement.
        </p>
        <ul style={{ color: 'var(--muted)', display: 'grid', gap: '0.45rem', marginTop: '0.85rem', paddingLeft: '1.25rem' }}>
          <li>Docker Desktop est lancé si tu utilises le Postgres du projet.</li>
          <li>
            <code>DATABASE_URL</code> existe côté backend et pointe vers la bonne base locale.
          </li>
          <li>Les migrations Prisma ont été appliquées avec <code>pnpm db:migrate</code>.</li>
          <li>Les données de démonstration ont été chargées avec <code>pnpm db:seed</code>.</li>
        </ul>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Présence token local/cookie</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem' }}>
          Le diagnostic confirme uniquement la présence des clés d’authentification. Il n’affiche jamais leur contenu.
        </p>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            marginTop: '1rem',
          }}
        >
          <TokenPresence label="Access token localStorage" present={tokenPresence.accessTokenLocal} />
          <TokenPresence label="Access token cookie" present={tokenPresence.accessTokenCookie} />
          <TokenPresence label="Refresh token localStorage" present={tokenPresence.refreshTokenLocal} />
          <TokenPresence label="Refresh token cookie" present={tokenPresence.refreshTokenCookie} />
        </div>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Liens rapides</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {quickLinks.map((link) => (
            <Link className="btn" href={link.href} key={link.href} style={{ background: '#1d1d1f' }}>
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
        API ciblée: <code>{API_URL}</code>. Si le backend est arrêté ou inaccessible, les cartes affichent une erreur
        exploitable et les liens de navigation restent disponibles.
      </p>
    </section>
  );
}

async function checkHealth(): Promise<EndpointCheck> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    if (!res.ok) {
      return { detail: `Erreur HTTP ${res.status} sur /health.`, status: 'error' };
    }

    const data = (await res.json()) as { ok?: boolean; service?: string };
    if (!data.ok) {
      return { detail: 'Réponse reçue, mais le champ ok est absent ou faux.', status: 'warning' };
    }

    return {
      detail: `OK - ${data.service ?? 'service API joignable'}.`,
      status: 'ok',
    };
  } catch {
    return {
      detail: 'API indisponible depuis le navigateur. Vérifie que le backend écoute bien sur l’URL configurée.',
      status: 'error',
    };
  }
}

async function checkDatabase(): Promise<EndpointCheck> {
  try {
    const res = await fetch(`${API_URL}/health/db`, { cache: 'no-store' });
    if (res.status === 404) {
      return {
        detail: 'Endpoint /health/db absent sur ce backend. Les autres diagnostics restent disponibles.',
        status: 'warning',
      };
    }

    const data = (await res.json().catch(() => null)) as { message?: string; status?: 'ok' | 'error' } | null;
    const message = data?.message ?? `Réponse HTTP ${res.status} sans message exploitable.`;

    if (!res.ok || data?.status === 'error') {
      return {
        detail: `${message} Vérifie Docker Desktop, DATABASE_URL, puis migrate/seed.`,
        status: 'error',
      };
    }

    if (data?.status !== 'ok') {
      return {
        detail: 'Réponse reçue, mais le champ status est absent ou inattendu.',
        status: 'warning',
      };
    }

    return {
      detail: `OK - ${message}`,
      status: 'ok',
    };
  } catch {
    return {
      detail: 'Diagnostic DB inaccessible. Vérifie d’abord que le backend répond sur /health.',
      status: 'error',
    };
  }
}

async function checkCatalog(): Promise<EndpointCheck> {
  try {
    const res = await fetch(`${API_URL}/catalog`, { cache: 'no-store' });
    if (!res.ok) {
      return { detail: `Erreur HTTP ${res.status} sur /catalog.`, status: 'error' };
    }

    const data = (await res.json()) as { courses?: unknown[] };
    if (!Array.isArray(data.courses)) {
      return { detail: 'Réponse reçue, mais le catalogue ne contient pas de liste courses.', status: 'warning' };
    }

    return {
      detail: `OK - ${data.courses.length} parcours détecté${data.courses.length > 1 ? 's' : ''}.`,
      status: 'ok',
    };
  } catch {
    return {
      detail: 'Catalogue indisponible. Le front peut encore utiliser ses fallbacks de démonstration.',
      status: 'error',
    };
  }
}

function StatusCard({ detail, label, status, title }: { detail: string; label: string; status: CheckStatus; title: string }) {
  return (
    <article className="card" style={{ borderColor: statusColor(status), display: 'grid', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
          {label}
        </p>
        <span
          style={{
            background: statusBackground(status),
            borderRadius: 999,
            color: statusColor(status),
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '0.25rem 0.6rem',
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel(status)}
        </span>
      </div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{title}</h2>
      <p style={{ color: 'var(--muted)' }}>{detail}</p>
    </article>
  );
}

function TokenPresence({ label, present }: { label: string; present: boolean }) {
  return (
    <div style={{ background: '#f5f5f7', borderRadius: 12, padding: '0.85rem' }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 700 }}>{label}</p>
      <strong style={{ color: present ? '#0f7a3b' : '#b42318', display: 'block', marginTop: '0.2rem' }}>
        {present ? 'Présent' : 'Absent'}
      </strong>
    </div>
  );
}

function statusLabel(status: CheckStatus) {
  if (status === 'ok') return 'OK';
  if (status === 'warning') return 'À vérifier';
  if (status === 'error') return 'Erreur';
  return 'En cours';
}

function statusColor(status: CheckStatus) {
  if (status === 'ok') return '#0f7a3b';
  if (status === 'warning') return '#a15c00';
  if (status === 'error') return '#b42318';
  return 'var(--accent)';
}

function statusBackground(status: CheckStatus) {
  if (status === 'ok') return '#e7f7ee';
  if (status === 'warning') return '#fff3d6';
  if (status === 'error') return '#fee4e2';
  return '#eef6ff';
}
