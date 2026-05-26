import type { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_SEC,
  buildAccessCookie,
  buildRefreshCookie,
  buildRememberMeCookie,
  clearAuthCookies,
  readRememberMeFromCookie,
  REFRESH_COOKIE,
  REMEMBER_COOKIE,
} from '@/lib/auth-cookies.server';

import { API_URL } from './api-url';

export type BackendSession = {
  accessToken: string;
  refreshToken: string;
};

export async function refreshBackendSession(refreshToken: string): Promise<BackendSession | null> {
  try {
    const backendResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!backendResponse.ok) return null;

    const session = (await backendResponse.json()) as BackendSession;
    if (!session.accessToken || !session.refreshToken) return null;
    return session;
  } catch {
    return null;
  }
}

export function applySessionCookies(
  response: NextResponse,
  session: BackendSession,
  rememberMe: boolean
) {
  response.cookies.set(buildAccessCookie(session.accessToken));
  response.cookies.set(buildRefreshCookie(session.refreshToken, rememberMe));
  response.cookies.set(buildRememberMeCookie(rememberMe));
}

export function clearSessionCookies(response: NextResponse) {
  for (const cookie of clearAuthCookies()) {
    response.cookies.set(cookie);
  }
}

export function readRememberMe(cookieStore: { get: (name: string) => { value: string } | undefined }) {
  return readRememberMeFromCookie(cookieStore.get(REMEMBER_COOKIE)?.value);
}

export { ACCESS_COOKIE, ACCESS_MAX_AGE_SEC, REFRESH_COOKIE, REMEMBER_COOKIE, API_URL };
