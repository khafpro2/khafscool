import { NextResponse } from 'next/server';
import { applySessionCookies } from '@/lib/auth-session.server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type RegisterBody = {
  email?: string;
  password?: string;
  displayName?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const email = body.email?.trim();
  const password = body.password;
  const displayName = body.displayName?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'CREDENTIALS_REQUIRED' }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
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

    const rememberMe = session.rememberMe ?? true;
    const response = NextResponse.json({ user: session.user, rememberMe });
    applySessionCookies(
      response,
      { accessToken: session.accessToken, refreshToken: session.refreshToken },
      rememberMe
    );
    return response;
  } catch {
    return NextResponse.json({ error: 'REGISTER_FAILED' }, { status: 502 });
  }
}
