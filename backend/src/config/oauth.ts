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
