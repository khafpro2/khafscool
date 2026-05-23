export type OAuthProviderName = 'apple' | 'google' | 'microsoft';

export interface OAuthProviderConfig {
  name: OAuthProviderName;
  authorizationURL: string;
  tokenURL: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string;
  usePKCE: boolean;
}

function cfg(
  name: OAuthProviderName,
  authorizationURL: string,
  tokenURL: string,
  scope: string
): OAuthProviderConfig {
  const upper = name.toUpperCase();
  return {
    name,
    authorizationURL,
    tokenURL,
    clientId: process.env[`${upper}_CLIENT_ID`] ?? '',
    clientSecret: process.env[`${upper}_CLIENT_SECRET`],
    redirectUri: process.env[`${upper}_REDIRECT_URI`] ?? `http://localhost:4000/auth/${name}/callback`,
    scope,
    usePKCE: true,
  };
}

export type OAuthProviderStatus = 'configured' | 'stub' | 'disabled';

function envFlag(name: string): boolean {
  return process.env[name]?.trim().toLowerCase() === 'true';
}

function isAppleConfigured(): boolean {
  const clientId = process.env.APPLE_CLIENT_ID?.trim();
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const privateKey = process.env.APPLE_PRIVATE_KEY?.trim();
  return Boolean(clientId && teamId && keyId && privateKey);
}

function isProviderConfigured(name: OAuthProviderName): boolean {
  const upper = name.toUpperCase();
  const clientId = process.env[`${upper}_CLIENT_ID`]?.trim();
  const clientSecret = process.env[`${upper}_CLIENT_SECRET`]?.trim();
  if (name === 'apple') return isAppleConfigured();
  return Boolean(clientId && clientSecret);
}

export function getOAuthProviderStatus(name: OAuthProviderName): OAuthProviderStatus {
  const upper = name.toUpperCase();
  if (envFlag(`${upper}_OAUTH_DISABLED`) || envFlag('OAUTH_DISABLED')) {
    return 'disabled';
  }
  if (isProviderConfigured(name)) return 'configured';
  return 'stub';
}

export function getOAuthStatusSnapshot(): Record<OAuthProviderName, OAuthProviderStatus> {
  return {
    apple: getOAuthProviderStatus('apple'),
    google: getOAuthProviderStatus('google'),
    microsoft: getOAuthProviderStatus('microsoft'),
  };
}

export const oauthProviders: Record<OAuthProviderName, OAuthProviderConfig> = {
  apple: cfg(
    'apple',
    'https://appleid.apple.com/auth/authorize',
    'https://appleid.apple.com/auth/token',
    'name email'
  ),
  google: cfg(
    'google',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    'openid email profile'
  ),
  microsoft: cfg(
    'microsoft',
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    'openid profile email offline_access'
  ),
};
