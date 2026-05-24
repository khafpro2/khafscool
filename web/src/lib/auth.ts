import type { AuthResponse, AuthUser } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000';
const USER_KEY = 'ama_user';
const REMEMBER_KEY = 'ama_remember_me';

/** Indique une session HttpOnly côté navigateur (jeton non lisible en JS). */
export const COOKIE_SESSION = '__cookie_session__';

/** Jeton d’accès JWT — renouvelé automatiquement via le refresh token. */
export const ACCESS_TOKEN_TTL_MINUTES = 15;
/** Durée refresh sans « Se souvenir de moi » (alignée backend). */
export const REFRESH_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;
/** Durée refresh avec « Se souvenir de moi » (alignée backend). */
export const REFRESH_REMEMBER_MAX_AGE_SEC = 60 * 60 * 24 * 90;

type RefreshedSession = Pick<AuthResponse, 'accessToken' | 'refreshToken'>;

export type StoreAuthOptions = {
  rememberMe?: boolean;
};

export function readRememberMePreference(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = window.localStorage.getItem(REMEMBER_KEY);
  if (raw === '0') return false;
  return true;
}

export function writeRememberMePreference(rememberMe: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REMEMBER_KEY, rememberMe ? '1' : '0');
}

export async function storeAuthTokens(auth: AuthResponse, options?: StoreAuthOptions) {
  if (typeof window === 'undefined') return;

  const rememberMe = options?.rememberMe ?? auth.rememberMe ?? readRememberMePreference();
  writeRememberMePreference(rememberMe);

  if (auth.accessToken === COOKIE_SESSION) {
    storeAuthenticatedUser(auth.user);
    return;
  }

  const res = await fetch('/api/auth/session', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      rememberMe,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('SESSION_PERSIST_FAILED');
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function storeAuthenticatedUser(user: AuthUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  if (typeof window === 'undefined') return undefined;
  return getStoredUser() ? COOKIE_SESSION : undefined;
}

export function getRefreshToken() {
  return undefined;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function updateStoredUserDisplayName(displayName: string) {
  if (typeof window === 'undefined') return;
  const user = getStoredUser();
  if (!user) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify({ ...user, displayName }));
}

export function getAuthTokenPresence() {
  const hasUser = Boolean(getStoredUser());
  return {
    accessTokenCookie: hasUser,
    accessTokenLocal: false,
    refreshTokenCookie: hasUser,
    refreshTokenLocal: false,
    rememberMe: readRememberMePreference(),
  };
}

export async function refreshSession(): Promise<RefreshedSession | null> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Refresh failed ${res.status}`);

    return {
      accessToken: COOKIE_SESSION,
      refreshToken: COOKIE_SESSION,
    };
  } catch {
    clearAuthTokens();
    return null;
  }
}

export async function logoutSession() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } finally {
    clearAuthTokens();
  }
}

export async function logoutAllDevices() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } finally {
    clearAuthTokens();
  }
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(USER_KEY);
  void fetch('/api/auth/session', {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
  });
}

export async function bootstrapAuthSession() {
  if (typeof window === 'undefined') return;

  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      clearAuthTokens();
      return;
    }

    const data = (await res.json()) as { authenticated?: boolean };
    if (!data.authenticated) {
      clearAuthTokens();
    }
  } catch {
    // Ignore network errors during bootstrap.
  }
}

/** Accepte uniquement un chemin relatif interne (ex. `/dashboard`). */
export function sanitizeRedirectPath(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (/^https?:/i.test(trimmed)) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}

export function buildAuthUrl(redirectPath?: string): string {
  const safe = sanitizeRedirectPath(redirectPath);
  if (!safe || safe === '/auth') return '/auth';
  return `/auth?redirect=${encodeURIComponent(safe)}`;
}

export function buildOAuthStartUrl(provider: string, redirectPath?: string): string {
  const safe = sanitizeRedirectPath(redirectPath) ?? '/dashboard';
  const params = new URLSearchParams({ redirect: safe });
  return `${API_URL}/auth/${provider}/start?${params.toString()}`;
}
