import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  applySessionCookies,
  clearSessionCookies,
  readRememberMe,
  refreshBackendSession,
  REFRESH_COOKIE,
} from '@/lib/auth-session.server';

type SessionBody = {
  refreshToken?: string;
  accessToken?: string;
  rememberMe?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SessionBody;
  const refreshToken = body.refreshToken?.trim();
  const accessToken = body.accessToken?.trim();

  if (!refreshToken || !accessToken) {
    return NextResponse.json({ error: 'SESSION_TOKENS_REQUIRED' }, { status: 400 });
  }

  const rememberMe = body.rememberMe ?? true;
  const response = NextResponse.json({ ok: true });
  applySessionCookies(response, { accessToken, refreshToken }, rememberMe);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  return NextResponse.json({
    hasRefreshToken: Boolean(refreshToken),
    authenticated: Boolean(refreshToken),
  });
}

export async function PATCH() {
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
