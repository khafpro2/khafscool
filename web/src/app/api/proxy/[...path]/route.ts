import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  API_URL,
  applySessionCookies,
  readRememberMe,
  refreshBackendSession,
  REFRESH_COOKIE,
} from '@/lib/auth-session.server';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

async function forwardRequest(request: Request, backendPath: string, accessToken?: string) {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
    if (key.toLowerCase() === 'authorization') return;
    headers.set(key, value);
  });

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  return fetch(`${API_URL}${backendPath}`, init);
}

function copyResponseHeaders(source: Response, target: NextResponse) {
  source.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    target.headers.set(key, value);
  });
}

async function proxyWithSession(request: Request, backendPath: string) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  const rememberMe = readRememberMe(cookieStore);

  let backendResponse = await forwardRequest(request, backendPath, accessToken);

  if (backendResponse.status === 401 && refreshToken) {
    const refreshed = await refreshBackendSession(refreshToken);
    if (refreshed) {
      accessToken = refreshed.accessToken;
      backendResponse = await forwardRequest(request, backendPath, accessToken);

      const body = await backendResponse.text();
      const response = new NextResponse(body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
      });
      copyResponseHeaders(backendResponse, response);
      applySessionCookies(response, refreshed, rememberMe);
      return response;
    }
  }

  const body = await backendResponse.text();
  const response = new NextResponse(body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });
  copyResponseHeaders(backendResponse, response);
  return response;
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleProxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const backendPath = `/${path.join('/')}${new URL(request.url).search}`;
  return proxyWithSession(request, backendPath);
}

export async function GET(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}
