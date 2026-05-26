import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ACCESS_COOKIE, API_URL, clearSessionCookies, REFRESH_COOKIE } from '@/lib/auth-session.server';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  try {
    if (accessToken && refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      });
    } else if (accessToken) {
      await fetch(`${API_URL}/auth/logout-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      });
    }
  } catch {
    // Clear local session even if backend logout fails.
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}
