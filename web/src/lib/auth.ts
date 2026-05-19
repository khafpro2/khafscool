import type { AuthResponse, AuthUser } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const ACCESS_KEY = 'ama_access';
const REFRESH_KEY = 'ama_refresh';
const USER_KEY = 'ama_user';

type RefreshedSession = Pick<AuthResponse, 'accessToken' | 'refreshToken'>;

export function storeAuthTokens(auth: AuthResponse) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_KEY, auth.accessToken);
  window.localStorage.setItem(REFRESH_KEY, auth.refreshToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  setCookie(ACCESS_KEY, auth.accessToken, 60 * 60);
  setCookie(REFRESH_KEY, auth.refreshToken, 60 * 60 * 24 * 30);
}

export function getAccessToken() {
  return readStoredValue(ACCESS_KEY);
}

export function getRefreshToken() {
  return readStoredValue(REFRESH_KEY);
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

export function getAuthTokenPresence() {
  if (typeof window === 'undefined') {
    return {
      accessTokenCookie: false,
      accessTokenLocal: false,
      refreshTokenCookie: false,
      refreshTokenLocal: false,
    };
  }

  return {
    accessTokenCookie: Boolean(readCookie(ACCESS_KEY)),
    accessTokenLocal: Boolean(window.localStorage.getItem(ACCESS_KEY)),
    refreshTokenCookie: Boolean(readCookie(REFRESH_KEY)),
    refreshTokenLocal: Boolean(window.localStorage.getItem(REFRESH_KEY)),
  };
}

export async function refreshSession(): Promise<RefreshedSession | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Refresh failed ${res.status}`);

    const session = (await res.json()) as RefreshedSession;
    storeSessionTokens(session);
    return session;
  } catch {
    clearAuthTokens();
    return null;
  }
}

export async function logoutSession() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  try {
    if (accessToken && refreshToken) {
      const res = await sendLogout(accessToken, refreshToken);
      if (res.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) await sendLogout(refreshed.accessToken, refreshed.refreshToken);
      }
    }
  } finally {
    clearAuthTokens();
  }
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
  setCookie(ACCESS_KEY, '', 0);
  setCookie(REFRESH_KEY, '', 0);
}

function storeSessionTokens(session: RefreshedSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_KEY, session.accessToken);
  window.localStorage.setItem(REFRESH_KEY, session.refreshToken);
  setCookie(ACCESS_KEY, session.accessToken, 60 * 60);
  setCookie(REFRESH_KEY, session.refreshToken, 60 * 60 * 24 * 30);
}

function sendLogout(accessToken: string, refreshToken: string) {
  return fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });
}

function readStoredValue(key: string) {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(key) ?? readCookie(key) ?? undefined;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function readCookie(name: string) {
  const value = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : undefined;
}
