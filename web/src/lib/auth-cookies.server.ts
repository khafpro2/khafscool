import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const REFRESH_COOKIE = 'ama_refresh';
export const ACCESS_COOKIE = 'ama_access';
export const REMEMBER_COOKIE = 'ama_remember_me';

export const ACCESS_MAX_AGE_SEC = 60 * 60;
export const REFRESH_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;
export const REFRESH_REMEMBER_MAX_AGE_SEC = 60 * 60 * 24 * 90;

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function refreshCookieMaxAge(rememberMe: boolean) {
  return rememberMe ? REFRESH_REMEMBER_MAX_AGE_SEC : REFRESH_SESSION_MAX_AGE_SEC;
}

export function buildAccessCookie(accessToken: string): ResponseCookie {
  return {
    name: ACCESS_COOKIE,
    value: accessToken,
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE_SEC,
  };
}

export function buildRefreshCookie(refreshToken: string, rememberMe: boolean): ResponseCookie {
  return {
    name: REFRESH_COOKIE,
    value: refreshToken,
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: refreshCookieMaxAge(rememberMe),
  };
}

export function buildRememberMeCookie(rememberMe: boolean): ResponseCookie {
  return {
    name: REMEMBER_COOKIE,
    value: rememberMe ? '1' : '0',
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: refreshCookieMaxAge(rememberMe),
  };
}

export function clearAuthCookies(): ResponseCookie[] {
  return [REFRESH_COOKIE, ACCESS_COOKIE, REMEMBER_COOKIE].map((name) => ({
    name,
    value: '',
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }));
}

export function readRememberMeFromCookie(value: string | undefined) {
  if (value === '0') return false;
  return true;
}
