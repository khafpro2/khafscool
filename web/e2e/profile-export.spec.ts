import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:4000';

const mockUser = {
  id: 'e2e-user-demo',
  email: 'demo@ama.dev',
  displayName: 'Technicien démo',
  provider: 'EMAIL',
};

const mockAuthResponse = {
  accessToken: 'e2e-access-token',
  refreshToken: 'e2e-refresh-token',
  user: mockUser,
  rememberMe: true,
  accessTokenTtlMinutes: 15,
};

const mockDashboard = {
  user: mockUser,
  stats: {
    points: 120,
    level: 'TECHNICIAN',
    modulesCompleted: 1,
    timeSpentMinutes: 12,
    averageQuizScore: 85,
    preparationScore: 72,
  },
  badges: ['apple-mdm-foundation'],
  quests: [],
  certificationSprint: null,
  courses: [],
  completedCourses: [],
  learningStreak: { currentDays: 3, longestDays: 5, lastActivityDate: '2026-05-20' },
  recentActivity: [],
};

test.describe('Profil — export RGPD (compte connecté)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAuthResponse),
      });
    });

    await page.route(`${API_BASE}/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    });

    await page.route(`${API_BASE}/users/me/dashboard`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboard),
      });
    });
  });

  test('connexion démo puis bouton export visible sur le profil', async ({ page }) => {
    await page.goto('/auth?redirect=/profile');

    await page.getByLabel(/Email/i).fill('demo@ama.dev');
    await page.getByLabel(/Mot de passe/i).fill('demo-password-ci');
    await page.getByRole('button', { name: /Se connecter/i }).first().click();

    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('heading', { name: /Export et suppression \(RGPD\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Exporter mes données \(JSON\)/i })).toBeVisible();
  });
});
