import type { Page } from '@playwright/test';
import { DEMO_ACCOUNT } from '@ama/shared/constants';
import { BFF_AUTH_LOGIN, PROXY_AUTH_ME, PROXY_DASHBOARD, PROXY_USER_EXPORT } from './proxy-routes';

export const mockDemoUser = {
  id: 'e2e-user-demo',
  email: DEMO_ACCOUNT.email,
  displayName: DEMO_ACCOUNT.displayName,
  provider: 'EMAIL',
};

export const mockAuthResponse = {
  accessToken: 'e2e-access-token',
  refreshToken: 'e2e-refresh-token',
  user: mockDemoUser,
  rememberMe: true,
  accessTokenTtlMinutes: 15,
};

export async function mockAuthenticatedSession(page: Page) {
  await page.route(BFF_AUTH_LOGIN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockDemoUser, rememberMe: true }),
    });
  });

  await page.route('**/api/auth/session', async (route) => {
    const method = route.request().method();
    if (method === 'POST' || method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
      return;
    }
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          hasAccessToken: true,
          hasRefreshToken: true,
        }),
      });
      return;
    }
    await route.continue();
  });
}

export async function mockDashboard(page: Page, dashboard: Record<string, unknown>) {
  await page.route(PROXY_DASHBOARD, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(dashboard),
    });
  });
}

export async function mockCurrentUser(page: Page, user: Record<string, unknown> = mockDemoUser) {
  await page.route(PROXY_AUTH_ME, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user),
    });
  });
}

export const mockUserExportPayload = {
  exportedAt: '2026-05-24T12:00:00.000Z',
  profile: {
    id: mockDemoUser.id,
    email: mockDemoUser.email,
    displayName: mockDemoUser.displayName,
    avatarUrl: null,
    provider: mockDemoUser.provider,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-05-20T00:00:00.000Z',
  },
  progress: {
    points: 120,
    level: 'TECHNICIAN',
    badges: ['apple-mdm-foundation'],
  },
  moduleProgress: [],
  quests: [],
  subscription: null,
};

export async function mockUserExport(page: Page, payload: Record<string, unknown> = mockUserExportPayload) {
  await page.route(PROXY_USER_EXPORT, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });
}

export async function loginDemoUser(page: Page, redirectPath = '/dashboard') {
  await mockAuthenticatedSession(page);
  await page.goto(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
  await page.getByLabel(/Email/i).fill(DEMO_ACCOUNT.email);
  await page.getByLabel(/Mot de passe/i).fill(DEMO_ACCOUNT.password);
  await page.getByRole('button', { name: /Se connecter/i }).first().click();
}
