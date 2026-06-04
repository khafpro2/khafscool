import { NextResponse } from 'next/server';
import { applySessionCookies } from '@/lib/auth-session.server';

import { API_URL } from '@/lib/api-url';

type ExchangeBody = {
  sessionCode?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ExchangeBody;
  const sessionCode = body.sessionCode?.trim();

  if (!sessionCode) {
    return NextResponse.json({ error: 'SESSION_CODE_REQUIRED' }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${API_URL}/auth/oauth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCode }),
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      const errorBody = (await backendResponse.json().catch(() => ({}))) as { error?: string };
      return NextResponse.json(
        { error: errorBody.error ?? 'OAUTH_EXCHANGE_FAILED' },
        { status: backendResponse.status }
      );
    }

    const session = (await backendResponse.json()) as {
      accessToken: string;
      refreshToken: string;
      user: unknown;
      rememberMe?: boolean;
    };

    const response = NextResponse.json({ user: session.user });
    applySessionCookies(
      response,
      { accessToken: session.accessToken, refreshToken: session.refreshToken },
      session.rememberMe ?? true
    );
    return response;
  } catch {
    return NextResponse.json({ error: 'OAUTH_EXCHANGE_FAILED' }, { status: 502 });
  }
}
