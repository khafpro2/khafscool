import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const OAUTH_SESSION_TOKEN_TYPE = 'oauth_session';
export const OAUTH_PKCE_TOKEN_TYPE = 'oauth_pkce';

const OAUTH_SESSION_TTL = '60s';
const OAUTH_PKCE_TTL = '10m';

export type OAuthSessionPayload = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
    provider: string;
  };
};

export type OAuthPkcePayload = {
  verifier: string;
  redirect?: string;
};

type SignedOAuthSessionPayload = OAuthSessionPayload & {
  typ: typeof OAUTH_SESSION_TOKEN_TYPE;
  jti: string;
};

type SignedOAuthPkcePayload = OAuthPkcePayload & {
  typ: typeof OAUTH_PKCE_TOKEN_TYPE;
};

export function createOAuthSessionCode(payload: OAuthSessionPayload) {
  const signed: SignedOAuthSessionPayload = {
    ...payload,
    typ: OAUTH_SESSION_TOKEN_TYPE,
    jti: crypto.randomBytes(16).toString('hex'),
  };

  return jwt.sign(signed, env.jwtSecret, { expiresIn: OAUTH_SESSION_TTL, algorithm: 'HS256' });
}

export function consumeOAuthSessionCode(code: string): OAuthSessionPayload {
  try {
    const decoded = jwt.verify(code, env.jwtSecret, { algorithms: ['HS256'] }) as SignedOAuthSessionPayload;

    if (decoded.typ !== OAUTH_SESSION_TOKEN_TYPE) {
      throw new Error('OAUTH_SESSION_CODE_INVALID');
    }

    return {
      accessToken: decoded.accessToken,
      refreshToken: decoded.refreshToken,
      user: decoded.user,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'OAUTH_SESSION_CODE_INVALID') {
      throw error;
    }
    throw new Error('OAUTH_SESSION_CODE_INVALID');
  }
}

export function signOAuthPkceState(payload: OAuthPkcePayload) {
  const signed: SignedOAuthPkcePayload = {
    ...payload,
    typ: OAUTH_PKCE_TOKEN_TYPE,
  };

  return jwt.sign(signed, env.jwtSecret, { expiresIn: OAUTH_PKCE_TTL, algorithm: 'HS256' });
}

export function consumeOAuthPkceState(state: string): OAuthPkcePayload | undefined {
  try {
    const decoded = jwt.verify(state, env.jwtSecret, { algorithms: ['HS256'] }) as SignedOAuthPkcePayload;
    if (decoded.typ !== OAUTH_PKCE_TOKEN_TYPE || !decoded.verifier) {
      return undefined;
    }

    return {
      verifier: decoded.verifier,
      redirect: decoded.redirect,
    };
  } catch {
    return undefined;
  }
}
