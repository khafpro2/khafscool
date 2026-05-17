import type { AuthResponse } from './api';

const ACCESS_KEY = 'ama_access';
const REFRESH_KEY = 'ama_refresh';
const USER_KEY = 'ama_user';

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

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
  setCookie(ACCESS_KEY, '', 0);
  setCookie(REFRESH_KEY, '', 0);
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
