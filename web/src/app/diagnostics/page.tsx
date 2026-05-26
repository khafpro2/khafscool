'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/lib/api';
import { getAuthTokenPresence } from '@/lib/auth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type CheckStatus = 'pending' | 'ok' | 'error' | 'warning';

type EndpointCheck = {
  detail: string;
  status: CheckStatus;
};

const EXPECTED_CATALOG_SLUGS = ['apple-cert-prep', 'jamf-pro-foundations', 'intune-ios-enrollment'];

const DEV_STACK_README =
  'https://github.com/khafpro2/khafscool/blob/main/README.md#démarrage-rapide';

const quickLinks = [
  { href: '/auth', label: 'Connexion' },
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/courses', label: 'Parcours' },
  { href: '/badges', label: 'Badges' },
  { href: '/quests', label: 'Quêtes' },
  { href: '/sprint', label: 'Sprint' },
  { href: '/mvp', label: 'MVP' },
];

type OAuthProviderStatus = 'configured' | 'stub' | 'disabled';

type OAuthStatusSnapshot = {
  apple: OAuthProviderStatus;
  google: OAuthProviderStatus;
  microsoft: OAuthProviderStatus;
};

const initialEndpointCheck: EndpointCheck = {
  detail: 'Vérification en cours…',
  status: 'pending',
};

export default function DiagnosticsPage() {
  const [healthCheck, setHealthCheck] = useState<EndpointCheck>(initialEndpointCheck);
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [databaseCheck, setDatabaseCheck] = useState<EndpointCheck>(initialEndpointCheck);
  const [catalogCheck, setCatalogCheck] = useState<EndpointCheck>(initialEndpointCheck);
  const [oauthStatus, setOauthStatus] = useState<OAuthStatusSnapshot | null>(null);
  const [oauthCheck, setOauthCheck] = useState<EndpointCheck>(initialEndpointCheck);
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
    const [health, database, catalog, oauth] = await Promise.all([
      checkHealth(),
      checkDatabase(),
      checkCatalog(),
      checkOAuthStatus(),
    ]);
    setHealthCheck(health.check);
    setApiVersion(health.version);
    setDatabaseCheck(database);
    setCatalogCheck(catalog);
    setOauthStatus(oauth.snapshot);
    setOauthCheck(oauth.check);
  }

  const hasAnyToken = Object.values(tokenPresence).some(Boolean);
  const hasAccessToken = tokenPresence.accessTokenCookie || tokenPresence.accessTokenLocal;
  const hasRefreshToken = tokenPresence.refreshTokenCookie || tokenPresence.refreshTokenLocal;
  const sessionStatus: CheckStatus =
    hasAccessToken && hasRefreshToken ? 'ok' : hasAnyToken ? 'warning' : 'error';

  const apiUrlConfigured = Boolean(API_URL?.trim());
  const authClientStatus: CheckStatus = hasAccessToken && hasRefreshToken ? 'ok' : hasAnyToken ? 'warning' : 'error';

  const checklist = useMemo<Array<{ id: string; label: string; status: CheckStatus; detail: string }>>(
    () => [
      {
        id: 'api-health',
        label: 'Santé API (/health)',
        status: healthCheck.status,
        detail: healthCheck.detail,
      },
      {
        id: 'api-version',
        label: 'Version backend',
        status: apiVersion ? 'ok' : healthCheck.status === 'error' ? 'warning' : ('warning' as CheckStatus),
        detail: apiVersion
          ? `Version ${apiVersion} exposée par l’API.`
          : 'Champ version absent — redémarre le backend sur la branche courante.',
      },
      {
        id: 'database',
        label: 'Base de données (via /health/db)',
        status: databaseCheck.status,
        detail: databaseCheck.detail,
      },
      {
        id: 'catalog',
        label: 'Catalogue seedé (/catalog)',
        status: catalogCheck.status,
        detail: catalogCheck.detail,
      },
      {
        id: 'oauth-status',
        label: 'OAuth SSO (/auth/oauth/status)',
        status: oauthCheck.status,
        detail: oauthCheck.detail,
      },
      {
        id: 'api-url',
        label: 'URL API configurée (web)',
        status: apiUrlConfigured ? 'ok' : 'error',
        detail: apiUrlConfigured
          ? `NEXT_PUBLIC_API_URL → ${API_URL}`
          : 'Variable NEXT_PUBLIC_API_URL absente — le front bascule en mode démo.',
      },
      {
        id: 'auth-session',
        label: 'Session navigateur (tokens locaux)',
        status: authClientStatus,
        detail: hasAnyToken
          ? 'Jetons détectés en localStorage ou cookie (valeurs masquées).'
          : 'Aucun jeton — connecte-toi via /auth pour tester le dashboard.',
      },
      {
        id: 'auth-server',
        label: 'Auth API (JWT côté serveur)',
        status: 'warning' as CheckStatus,
        detail:
          'Non vérifiable depuis le navigateur. Contrôle JWT_SECRET, JWT_REFRESH_SECRET et CORS_ORIGIN (voir DEPLOYMENT.md).',
      },
    ],
    [
      apiUrlConfigured,
      apiVersion,
      authClientStatus,
      oauthCheck.detail,
      oauthCheck.status,
      catalogCheck.detail,
      catalogCheck.status,
      databaseCheck.detail,
      databaseCheck.status,
      hasAnyToken,
      healthCheck.detail,
      healthCheck.status,
    ]
  );

  return (
    <section style={{ padding: '1rem 0 2.5rem' }}>
      <div className="hero" style={{ marginTop: 0, padding: '2rem 1.75rem' }}>
        <span className="hero-eyebrow">Outils internes</span>
        <h1>Diagnostics MVP</h1>
        <p style={{ marginTop: '0.75rem', fontSize: '0.98rem' }}>
          Vérifie l’API, Prisma, le catalogue seedé, la configuration auth et la session locale — page réservée aux
          testeurs.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button type="button" onClick={runEndpointChecks}>
            Relancer les vérifications
          </Button>
          <Button href="/auth" variant="secondary">
            Tester la connexion
          </Button>
          <Button href={DEV_STACK_README} variant="ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Docs stack locale
          </Button>
        </div>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <p className="section-eyebrow">Synthèse</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Liste des contrôles</h2>
        <ul style={{ display: 'grid', gap: '0.65rem', marginTop: '1rem', padding: 0, listStyle: 'none' }}>
          {checklist.map((item) => (
            <li
              key={item.id}
              style={{
                display: 'grid',
                gap: '0.25rem',
                padding: '0.75rem 0.85rem',
                borderRadius: 12,
                background: 'var(--accent-soft)',
                border: `1px solid ${statusColor(item.status)}33`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.92rem' }}>{item.label}</strong>
                <Badge tone={item.status === 'ok' ? 'success' : item.status === 'warning' ? 'warning' : 'neutral'}>
                  {statusLabel(item.status)}
                </Badge>
              </div>
              <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          marginTop: '1.5rem',
        }}
      >
        <StatusCard detail={healthCheck.detail} label="API /health" status={healthCheck.status} title="Santé de l’API" />
        <StatusCard
          detail={
            apiVersion
              ? `Version ${apiVersion} — service joignable.`
              : 'Version non exposée par /health (met à jour le backend).'
          }
          label="Version API"
          status={apiVersion ? 'ok' : healthCheck.status === 'ok' ? 'warning' : healthCheck.status}
          title="Backend"
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
          status={sessionStatus}
          title="Tokens navigateur"
        />
      </section>

      <Card style={{ marginTop: '1rem' }}>
        <p className="section-eyebrow">OAuth</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>État des fournisseurs SSO</h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Lecture seule depuis <code>/auth/oauth/status</code>. En dev sans credentials, le mode <strong>stub</strong>{' '}
          simule un profil utilisateur. Voir <code>docs/OAUTH-PRODUCTION.md</code> pour la mise en prod.
        </p>
        {oauthStatus ? (
          <ul style={{ display: 'grid', gap: '0.65rem', marginTop: '1rem', padding: 0, listStyle: 'none' }}>
            {(['google', 'apple', 'microsoft'] as const).map((provider) => (
              <li
                key={provider}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 12,
                  background: 'var(--accent-soft)',
                }}
              >
                <strong style={{ fontSize: '0.92rem', textTransform: 'capitalize' }}>{provider}</strong>
                <Badge tone={oauthStatusTone(oauthStatus[provider])}>{oauthStatusLabel(oauthStatus[provider])}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ marginTop: '0.85rem' }}>
            {oauthCheck.detail}
          </p>
        )}
      </Card>

      <Card style={{ marginTop: '1rem' }}>
        <p className="section-eyebrow">Stack locale</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Démarrage dev-stack</h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Postgres + API + web en une commande. Voir aussi <code>DEPLOYMENT.md</code> pour les variables Vercel /
          Railway.
        </p>
        <ul style={{ color: 'var(--muted)', display: 'grid', gap: '0.45rem', marginTop: '0.85rem', paddingLeft: '1.25rem' }}>
          <li>
            <code>pnpm dev:stack</code> — lance Docker Postgres, backend (:4000) et Next.js (:3000).
          </li>
          <li>
            <code>pnpm setup</code> ou <code>pnpm db:migrate && pnpm db:seed</code> — première installation.
          </li>
          <li>
            <code>pnpm smoke:all</code> — smoke HTTP API + pages web principales.
          </li>
        </ul>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          <Button href={DEV_STACK_README} variant="secondary" size="sm">
            README — stack locale
          </Button>
          <Button href="/mvp" variant="ghost" size="sm">
            Parcours MVP
          </Button>
        </div>
      </Card>

      <Card style={{ marginTop: '1rem' }}>
        <p className="section-eyebrow">Dépannage local</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Conseils Docker, migrate et seed</h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Si la carte base de données reste en erreur, vérifie ces points sans partager tes variables d’environnement.
        </p>
        <ul style={{ color: 'var(--muted)', display: 'grid', gap: '0.45rem', marginTop: '0.85rem', paddingLeft: '1.25rem' }}>
          <li>
            Lance Docker Desktop si tu utilises le Postgres du projet (<code>pnpm db:up</code>) — port hôte{' '}
            <code>5433</code> par défaut (<code>compose.yaml</code>).
          </li>
          <li>
            Vérifie que <code>DATABASE_URL</code> côté backend utilise le port hôte (<code>5433</code>) et la base{' '}
            <code>apple_mdm_academy</code>.
          </li>
          <li>Applique les migrations : <code>pnpm db:migrate</code>.</li>
          <li>Charge les données de démo : <code>pnpm db:seed</code> (3 parcours × 3 unités).</li>
          <li>Redémarre le backend : <code>pnpm --filter backend dev</code>.</li>
        </ul>
      </Card>

      <Card style={{ marginTop: '1rem' }}>
        <p className="section-eyebrow">Session</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Présence token local/cookie</h2>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
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
          <TokenPresence label="Jeton d’accès (localStorage)" present={tokenPresence.accessTokenLocal} />
          <TokenPresence label="Jeton d’accès (cookie)" present={tokenPresence.accessTokenCookie} />
          <TokenPresence label="Jeton de rafraîchissement (localStorage)" present={tokenPresence.refreshTokenLocal} />
          <TokenPresence label="Jeton de rafraîchissement (cookie)" present={tokenPresence.refreshTokenCookie} />
        </div>
      </Card>

      <Card variant="soft" style={{ marginTop: '1rem' }}>
        <p className="section-eyebrow">Navigation</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Liens rapides</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {quickLinks.map((link) => (
            <Button key={link.href} href={link.href} variant="secondary" size="sm">
              {link.label}
            </Button>
          ))}
        </div>
      </Card>

      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
        API ciblée : <code>{API_URL}</code>. Page interne — aucun token ni secret n’est affiché.
      </p>
    </section>
  );
}

async function checkOAuthStatus(): Promise<{ check: EndpointCheck; snapshot: OAuthStatusSnapshot | null }> {
  try {
    const res = await fetch(`${API_URL}/auth/oauth/status`, { cache: 'no-store' });
    if (!res.ok) {
      return {
        check: { detail: `Erreur HTTP ${res.status} sur /auth/oauth/status.`, status: 'error' },
        snapshot: null,
      };
    }

    const data = (await res.json()) as OAuthStatusSnapshot;
    const providers = ['google', 'apple', 'microsoft'] as const;
    const configured = providers.filter((p) => data[p] === 'configured').length;
    const stub = providers.filter((p) => data[p] === 'stub').length;
    const disabled = providers.filter((p) => data[p] === 'disabled').length;

    const detail =
      configured > 0
        ? `${configured} fournisseur(s) configuré(s), ${stub} en stub, ${disabled} désactivé(s).`
        : `Mode dev : ${stub} stub, ${disabled} désactivé(s) — credentials OAuth non requis.`;

    return {
      check: { detail, status: configured > 0 ? 'ok' : 'warning' },
      snapshot: data,
    };
  } catch {
    return {
      check: {
        detail: 'Statut OAuth indisponible. Vérifie que le backend répond sur /auth/oauth/status.',
        status: 'error',
      },
      snapshot: null,
    };
  }
}

async function checkHealth(): Promise<{ check: EndpointCheck; version: string | null }> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    if (!res.ok) {
      return {
        check: { detail: `Erreur HTTP ${res.status} sur /health.`, status: 'error' },
        version: null,
      };
    }

    const data = (await res.json()) as { ok?: boolean; service?: string; version?: string };
    if (!data.ok) {
      return {
        check: { detail: 'Réponse reçue, mais le champ ok est absent ou faux.', status: 'warning' },
        version: data.version ?? null,
      };
    }

    const versionSuffix = data.version ? ` · v${data.version}` : '';

    return {
      check: {
        detail: `OK — ${data.service ?? 'service API joignable'}${versionSuffix}.`,
        status: 'ok',
      },
      version: data.version ?? null,
    };
  } catch {
    return {
      check: {
        detail: 'API indisponible depuis le navigateur. Vérifie que le backend écoute sur l’URL configurée.',
        status: 'error',
      },
      version: null,
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
        detail: `${message} Vérifie Docker, DATABASE_URL, puis migrate/seed.`,
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
      detail: `OK — ${message}`,
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

    const data = (await res.json()) as { courses?: { slug?: string }[] };
    if (!Array.isArray(data.courses)) {
      return { detail: 'Réponse reçue, mais le catalogue ne contient pas de liste courses.', status: 'warning' };
    }

    const slugs = data.courses.map((course) => course.slug).filter(Boolean) as string[];
    const missing = EXPECTED_CATALOG_SLUGS.filter((slug) => !slugs.includes(slug));

    if (missing.length > 0) {
      return {
        detail: `${data.courses.length} parcours détectés, mais slugs manquants : ${missing.join(', ')}. Relance le seed.`,
        status: 'warning',
      };
    }

    return {
      detail: `OK — ${data.courses.length} parcours dont les 3 slugs seedés (Apple, Jamf, Intune).`,
      status: 'ok',
    };
  } catch {
    return {
      detail: 'Catalogue indisponible. Le front peut encore utiliser ses fallbacks de démonstration.',
      status: 'error',
    };
  }
}

function StatusCard({
  detail,
  label,
  status,
  title,
}: {
  detail: string;
  label: string;
  status: CheckStatus;
  title: string;
}) {
  return (
    <Card style={{ borderColor: statusColor(status) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <p className="muted" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
          {label}
        </p>
        <Badge tone={status === 'ok' ? 'success' : status === 'warning' ? 'warning' : 'neutral'}>
          {statusLabel(status)}
        </Badge>
      </div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.5rem' }}>{title}</h2>
      <p className="muted" style={{ marginTop: '0.35rem' }}>{detail}</p>
    </Card>
  );
}

function TokenPresence({ label, present }: { label: string; present: boolean }) {
  return (
    <div style={{ background: 'var(--accent-soft)', borderRadius: 12, padding: '0.85rem' }}>
      <p className="muted" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
        {label}
      </p>
      <strong style={{ color: present ? 'var(--success)' : 'var(--danger)', display: 'block', marginTop: '0.2rem' }}>
        {present ? 'Présent' : 'Absent'}
      </strong>
    </div>
  );
}

function oauthStatusLabel(status: OAuthProviderStatus) {
  if (status === 'configured') return 'Configuré';
  if (status === 'stub') return 'Stub (dev)';
  return 'Désactivé';
}

function oauthStatusTone(status: OAuthProviderStatus): 'success' | 'warning' | 'neutral' {
  if (status === 'configured') return 'success';
  if (status === 'stub') return 'warning';
  return 'neutral';
}

function statusLabel(status: CheckStatus) {
  if (status === 'ok') return 'OK';
  if (status === 'warning') return 'À vérifier';
  if (status === 'error') return 'Erreur';
  return 'En cours';
}

function statusColor(status: CheckStatus) {
  if (status === 'ok') return 'var(--success)';
  if (status === 'warning') return 'var(--warning)';
  if (status === 'error') return 'var(--danger)';
  return 'var(--accent)';
}
