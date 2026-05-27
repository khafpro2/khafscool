import { resolveClientApiPath } from './api-url';

export type OAuthProviderName = 'apple' | 'google' | 'microsoft';
export type OAuthProviderStatus = 'configured' | 'stub' | 'disabled';

export type OAuthStatusSnapshot = Record<OAuthProviderName, OAuthProviderStatus> & {
  environment: 'development' | 'production';
};

export const OAUTH_PROVIDER_ORDER: OAuthProviderName[] = ['google', 'apple', 'microsoft'];

export async function fetchOAuthStatus(): Promise<OAuthStatusSnapshot | null> {
  try {
    const res = await fetch(resolveClientApiPath('/auth/oauth/status'), { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as OAuthStatusSnapshot;
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

export function summarizeOAuthStatus(snapshot: OAuthStatusSnapshot): string {
  const providers = OAUTH_PROVIDER_ORDER;
  const configured = providers.filter((p) => snapshot[p] === 'configured').length;
  const stub = providers.filter((p) => snapshot[p] === 'stub').length;
  const disabled = providers.filter((p) => snapshot[p] === 'disabled').length;

  if (snapshot.environment === 'production' && configured === 0) {
    return 'API en production sans SSO configuré — utilise l’email/mot de passe ou ajoute les variables OAuth sur Railway.';
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
