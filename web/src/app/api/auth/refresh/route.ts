import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  applySessionCookies,
  clearSessionCookies,
  readRememberMe,
  refreshBackendSession,
  REFRESH_COOKIE,
} from '@/lib/auth-session.server';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'REFRESH_TOKEN_MISSING' }, { status: 401 });
  }

  const rememberMe = readRememberMe(cookieStore);
  const session = await refreshBackendSession(refreshToken);

  if (!session) {
    const response = NextResponse.json({ error: 'REFRESH_FAILED' }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  applySessionCookies(response, session, rememberMe);
  return response;
}
