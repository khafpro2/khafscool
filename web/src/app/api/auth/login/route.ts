import { NextResponse } from 'next/server';
import { applySessionCookies } from '@/lib/auth-session.server';

import { API_URL } from '@/lib/api-url';

type LoginBody = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim();
  const password = body.password;
  const rememberMe = body.rememberMe ?? true;

  if (!email || !password) {
    return NextResponse.json({ error: 'CREDENTIALS_REQUIRED' }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      const errorBody = (await backendResponse.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      return NextResponse.json(errorBody, { status: backendResponse.status });
    }

    const session = (await backendResponse.json()) as {
      accessToken: string;
      refreshToken: string;
      user: unknown;
      rememberMe?: boolean;
    };

    const response = NextResponse.json({
      user: session.user,
      rememberMe: session.rememberMe ?? rememberMe,
    });
    applySessionCookies(
      response,
      { accessToken: session.accessToken, refreshToken: session.refreshToken },
      session.rememberMe ?? rememberMe
    );
    return response;
  } catch {
    return NextResponse.json(
      {
        error: 'API_UNREACHABLE',
        message:
          'Impossible de joindre le serveur. Vérifie que l’API est démarrée (pnpm dev:stack).',
      },
      { status: 502 },
    );
  }
}
