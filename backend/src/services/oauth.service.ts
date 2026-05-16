import crypto from 'crypto';
import type { OAuthProviderConfig, OAuthProviderName } from '../config/oauth.js';

export interface OAuthProfile {
  sub: string;
  email?: string;
  name?: string;
}

const pkceStore = new Map<string, { verifier: string; redirect?: string }>();

export function buildAuthorizeUrl(config: OAuthProviderConfig, mobileRedirect?: string) {
  const state = crypto.randomBytes(16).toString('hex');
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

  pkceStore.set(state, { verifier, redirect: mobileRedirect });

  const params = new URLSearchParams({
    client_id: config.clientId || 'dev-client-id',
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    ...(config.usePKCE ? { code_challenge: challenge, code_challenge_method: 'S256' } : {}),
  });

  return { url: `${config.authorizationURL}?${params}`, state };
}

export function consumePkce(state: string) {
  const entry = pkceStore.get(state);
  pkceStore.delete(state);
  return entry;
}

/** Dev stub: en prod, échanger code contre tokens puis appeler userinfo du fournisseur */
export async function exchangeCodeAndGetProfile(
  provider: OAuthProviderName,
  code: string,
  _config: OAuthProviderConfig
): Promise<OAuthProfile> {
  const sub = `${provider}_${crypto.createHash('sha256').update(code).digest('hex').slice(0, 16)}`;
  return {
    sub,
    email: `${sub}@oauth.dev`,
    name: `Utilisateur ${provider}`,
  };
}
