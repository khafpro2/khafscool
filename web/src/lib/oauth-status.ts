import { API_URL_DISPLAY, resolveClientApiPath } from './api-url';

export type OAuthProviderName = 'apple' | 'google' | 'microsoft';
export type OAuthProviderStatus = 'configured' | 'stub' | 'disabled';

export type OAuthStatusSnapshot = Record<OAuthProviderName, OAuthProviderStatus> & {
  environment: 'development' | 'production';
};

export const OAUTH_PROVIDER_ORDER: OAuthProviderName[] = ['google', 'apple', 'microsoft'];

const LOCAL_API_HOSTS = new Set(['localhost', '127.0.0.1']);

/** Heuristique quand l’API legacy ne renvoie pas encore `environment`. */
export function isProductionApiUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (LOCAL_API_HOSTS.has(parsed.hostname)) return false;
    return parsed.protocol === 'https:';
  } catch {
    return /railway\.app|render\.com/i.test(trimmed);
  }
}

export function resolveOAuthEnvironment(
  snapshot: Partial<OAuthStatusSnapshot> & Record<OAuthProviderName, OAuthProviderStatus>,
  apiUrlHint = API_URL_DISPLAY
): OAuthStatusSnapshot['environment'] {
  if (snapshot.environment === 'production' || snapshot.environment === 'development') {
    return snapshot.environment;
  }
  if (apiUrlHint && isProductionApiUrl(apiUrlHint)) return 'production';
  return 'development';
}

export function normalizeOAuthStatus(
  raw: Partial<OAuthStatusSnapshot> & Record<OAuthProviderName, OAuthProviderStatus>,
  apiUrlHint = API_URL_DISPLAY
): OAuthStatusSnapshot {
  return {
    apple: raw.apple ?? 'stub',
    google: raw.google ?? 'stub',
    microsoft: raw.microsoft ?? 'stub',
    environment: resolveOAuthEnvironment(raw, apiUrlHint),
  };
}

export async function fetchOAuthStatus(): Promise<OAuthStatusSnapshot | null> {
  try {
    const res = await fetch(resolveClientApiPath('/auth/oauth/status'), { cache: 'no-store' });
    if (!res.ok) return null;
    const raw = (await res.json()) as Partial<OAuthStatusSnapshot> &
      Record<OAuthProviderName, OAuthProviderStatus>;
    return normalizeOAuthStatus(raw);
  } catch {
    return null;
  }
}

export function oauthStatusLabel(status: OAuthProviderStatus): string {
  if (status === 'configured') return 'Configuré';
  if (status === 'stub') return 'Stub (dev)';
  return 'Désactivé';
}

export function oauthStatusTone(status: OAuthProviderStatus): 'success' | 'warning' | 'neutral' {
  if (status === 'configured') return 'success';
  if (status === 'stub') return 'warning';
  return 'neutral';
}

/** Texte d’aide affiché sous le badge d’un fournisseur. */
export function oauthProviderHelpText(
  provider: OAuthProviderName,
  status: OAuthProviderStatus,
  environment: OAuthStatusSnapshot['environment']
): string {
  if (status === 'disabled') {
    return `${provider} est désactivé via GOOGLE_OAUTH_DISABLED / APPLE_OAUTH_DISABLED / MICROSOFT_OAUTH_DISABLED ou OAUTH_DISABLED.`;
  }
  if (status === 'configured') {
    return 'Credentials présents sur l’API — connexion réelle chez le fournisseur.';
  }
  if (environment === 'production') {
    return 'Non configuré sur Railway : le bouton SSO renverra une erreur jusqu’à l’ajout des variables (voir docs/OAUTH-PRODUCTION.md).';
  }
  return 'Mode dev : un profil fictif est créé sans appeler Google / Apple / Microsoft.';
}

export function summarizeOAuthStatus(
  snapshot: OAuthStatusSnapshot,
  apiUrlHint = API_URL_DISPLAY
): string {
  const environment = resolveOAuthEnvironment(snapshot, apiUrlHint);
  const providers = OAUTH_PROVIDER_ORDER;
  const configured = providers.filter((p) => snapshot[p] === 'configured').length;
  const stub = providers.filter((p) => snapshot[p] === 'stub').length;
  const disabled = providers.filter((p) => snapshot[p] === 'disabled').length;

  if (environment === 'production' && configured === 0) {
    return 'SSO non configuré en production — connexion email/mot de passe OK. Voir docs/OAUTH-PRODUCTION.md pour Google, Apple et Microsoft.';
  }

  if (configured > 0) {
    return `${configured} fournisseur(s) en production réelle, ${stub} en stub, ${disabled} désactivé(s).`;
  }

  return `Mode développement : ${stub} fournisseur(s) en stub (connexion simulée), ${disabled} désactivé(s).`;
}

export function isOAuthProviderClickable(
  status: OAuthProviderStatus,
  environment: OAuthStatusSnapshot['environment']
): boolean {
  if (status === 'disabled') return false;
  if (status === 'configured') return true;
  return environment === 'development';
}
