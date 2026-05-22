import { API_URL } from '../config';
import { recordApiFailure, recordApiSuccess } from '../lib/api-status-store';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './auth';

function isNetworkError(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && error.name === 'AbortError');
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function loginWithEmail(
  email: string,
  password: string,
  rememberMe = true
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe }),
  });
  if (!res.ok) throw new Error(`Login failed ${res.status}`);
  return res.json() as Promise<AuthResponse>;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  });
  if (!res.ok) throw new Error(`Register failed ${res.status}`);
  return res.json() as Promise<AuthResponse>;
}

export async function updateDisplayName(displayName: string): Promise<AuthUser> {
  const data = await apiFetch<{ user: AuthUser }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ displayName }),
  });
  return data.user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function logoutAllSessions(): Promise<{ ok: true; revokedCount: number }> {
  return apiFetch<{ ok: true; revokedCount: number }>('/auth/logout-all', {
    method: 'POST',
  });
}

type RefreshedSession = {
  accessToken: string;
  refreshToken: string;
};

let refreshPromise: Promise<RefreshedSession | null> | null = null;

async function refreshSession(): Promise<RefreshedSession | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error(`Refresh failed ${res.status}`);

    const session = (await res.json()) as RefreshedSession;
    await saveTokens(session.accessToken, session.refreshToken);
    return session;
  } catch {
    await clearTokens();
    return null;
  }
}

function refreshSessionOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function hasAuthorizationHeader(headers?: HeadersInit) {
  if (!headers) return false;
  if (headers instanceof Headers) {
    return headers.has('Authorization');
  }
  if (Array.isArray(headers)) {
    return headers.some(([key]) => key.toLowerCase() === 'authorization');
  }
  return Object.keys(headers).some((key) => key.toLowerCase() === 'authorization');
}

function withAccessToken(headers: HeadersInit | undefined, accessToken: string): HeadersInit {
  const next = new Headers(headers);
  next.set('Authorization', `Bearer ${accessToken}`);
  next.set('Content-Type', 'application/json');
  return next;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers ?? {}),
  };

  try {
    let res = await fetch(`${API_URL}${path}`, { ...init, headers });

    if (res.status === 401 && hasAuthorizationHeader(headers)) {
      const refreshed = await refreshSessionOnce();
      if (refreshed) {
        res = await fetch(`${API_URL}${path}`, {
          ...init,
          headers: withAccessToken(init?.headers, refreshed.accessToken),
        });
      }
    }

    if (!res.ok) {
      recordApiFailure();
      throw new Error(`Erreur API ${res.status}`);
    }

    recordApiSuccess();
    return res.json() as Promise<T>;
  } catch (error) {
    if (isNetworkError(error)) {
      recordApiFailure();
    }
    throw error;
  }
}
