import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { OAuthProviderConfig, OAuthProviderName } from '../config/oauth.js';
import { getOAuthProviderStatus } from '../config/oauth.js';
import { env } from '../config/env.js';
import { consumeOAuthPkceState, signOAuthPkceState } from './oauth-session.service.js';

export interface OAuthProfile {
  sub: string;
  email?: string;
  name?: string;
}


export function buildAuthorizeUrl(config: OAuthProviderConfig, mobileRedirect?: string) {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const state = signOAuthPkceState({ verifier, redirect: mobileRedirect });

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
  return consumeOAuthPkceState(state);
}

type TokenResponse = {
  access_token?: string;
  id_token?: string;
  token_type?: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('OAUTH_INVALID_ID_TOKEN');
  const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
  return JSON.parse(payload) as Record<string, unknown>;
}

async function postTokenRequest(tokenUrl: string, params: Record<string, string>) {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'OAUTH_TOKEN_EXCHANGE_FAILED');
  }

  return body as TokenResponse;
}

function buildAppleClientSecret(config: OAuthProviderConfig) {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const privateKeyRaw = process.env.APPLE_PRIVATE_KEY?.trim();

  if (!teamId || !keyId || !privateKeyRaw || !config.clientId) {
    throw new Error('OAUTH_APPLE_MISCONFIGURED');
  }

  const privateKey = privateKeyRaw.includes('\\n')
    ? privateKeyRaw.replace(/\\n/g, '\n')
    : privateKeyRaw;

  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: teamId,
      iat: now,
      exp: now + 60 * 60 * 24 * 150,
      aud: 'https://appleid.apple.com',
      sub: config.clientId,
    },
    privateKey,
    { algorithm: 'ES256', keyid: keyId }
  );
}

async function exchangeGoogleCode(
  code: string,
  config: OAuthProviderConfig,
  pkceVerifier: string
): Promise<OAuthProfile> {
  if (!config.clientSecret) throw new Error('OAUTH_GOOGLE_MISCONFIGURED');

  const tokens = await postTokenRequest(config.tokenURL, {
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: pkceVerifier,
  });

  if (!tokens.access_token) throw new Error('OAUTH_TOKEN_EXCHANGE_FAILED');

  const userinfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: 'no-store',
  });

  if (!userinfoResponse.ok) throw new Error('OAUTH_PROFILE_FETCH_FAILED');

  const profile = (await userinfoResponse.json()) as { sub?: string; email?: string; name?: string };
  if (!profile.sub) throw new Error('OAUTH_PROFILE_INVALID');

  return {
    sub: profile.sub,
    email: profile.email,
    name: profile.name,
  };
}

async function exchangeMicrosoftCode(
  code: string,
  config: OAuthProviderConfig,
  pkceVerifier: string
): Promise<OAuthProfile> {
  if (!config.clientSecret) throw new Error('OAUTH_MICROSOFT_MISCONFIGURED');

  const tokens = await postTokenRequest(config.tokenURL, {
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: pkceVerifier,
  });

  if (tokens.id_token) {
    const claims = decodeJwtPayload(tokens.id_token);
    const sub = typeof claims.sub === 'string' ? claims.sub : undefined;
    if (!sub) throw new Error('OAUTH_PROFILE_INVALID');
    return {
      sub,
      email: typeof claims.email === 'string' ? claims.email : typeof claims.preferred_username === 'string' ? claims.preferred_username : undefined,
      name: typeof claims.name === 'string' ? claims.name : undefined,
    };
  }

  if (!tokens.access_token) throw new Error('OAUTH_TOKEN_EXCHANGE_FAILED');

  const profileResponse = await fetch('https://graph.microsoft.com/oidc/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: 'no-store',
  });

  if (!profileResponse.ok) throw new Error('OAUTH_PROFILE_FETCH_FAILED');

  const profile = (await profileResponse.json()) as { sub?: string; email?: string; name?: string };
  if (!profile.sub) throw new Error('OAUTH_PROFILE_INVALID');

  return {
    sub: profile.sub,
    email: profile.email,
    name: profile.name,
  };
}

async function exchangeAppleCode(code: string, config: OAuthProviderConfig): Promise<OAuthProfile> {
  const clientSecret = buildAppleClientSecret(config);

  const tokens = await postTokenRequest(config.tokenURL, {
    code,
    client_id: config.clientId,
    client_secret: clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  if (!tokens.id_token) throw new Error('OAUTH_TOKEN_EXCHANGE_FAILED');

  const claims = decodeJwtPayload(tokens.id_token);
  const sub = typeof claims.sub === 'string' ? claims.sub : undefined;
  if (!sub) throw new Error('OAUTH_PROFILE_INVALID');

  return {
    sub,
    email: typeof claims.email === 'string' ? claims.email : undefined,
    name: undefined,
  };
}

async function exchangeConfiguredProvider(
  provider: OAuthProviderName,
  code: string,
  config: OAuthProviderConfig,
  pkceVerifier: string
): Promise<OAuthProfile> {
  switch (provider) {
    case 'google':
      return exchangeGoogleCode(code, config, pkceVerifier);
    case 'microsoft':
      return exchangeMicrosoftCode(code, config, pkceVerifier);
    case 'apple':
      return exchangeAppleCode(code, config);
    default:
      throw new Error('OAUTH_UNKNOWN_PROVIDER');
  }
}

function exchangeDevStub(provider: OAuthProviderName, code: string): OAuthProfile {
  const sub = `${provider}_${crypto.createHash('sha256').update(code).digest('hex').slice(0, 16)}`;
  return {
    sub,
    email: `${sub}@oauth.dev`,
    name: `Utilisateur ${provider}`,
  };
}

export async function exchangeCodeAndGetProfile(
  provider: OAuthProviderName,
  code: string,
  config: OAuthProviderConfig,
  pkceVerifier?: string
): Promise<OAuthProfile> {
  const status = getOAuthProviderStatus(provider);

  if (status === 'disabled') {
    throw new Error('OAUTH_DISABLED');
  }

  if (status === 'configured') {
    if (!pkceVerifier && provider !== 'apple') {
      throw new Error('OAUTH_PKCE_REQUIRED');
    }
    return exchangeConfiguredProvider(provider, code, config, pkceVerifier ?? '');
  }

  if (!env.isDev) {
    throw new Error('OAUTH_UNAVAILABLE');
  }

  return exchangeDevStub(provider, code);
}
