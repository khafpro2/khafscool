import { expect, test } from '@playwright/test';
import {
  loginDemoUser,
  mockAuthenticatedSession,
  mockCurrentUser,
  mockDashboard,
  mockDemoUser,
  mockUserExport,
  mockUserExportPayload,
} from './helpers/auth-mocks';

const mockDashboardPayload = {
  user: mockDemoUser,
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
    await mockAuthenticatedSession(page);
    await mockDashboard(page, mockDashboardPayload);
    await mockCurrentUser(page);
    await mockUserExport(page);
  });

  test('connexion démo puis bouton export visible sur le profil', async ({ page }) => {
    await loginDemoUser(page, '/profile');

    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('heading', { name: /Export et suppression \(RGPD\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Exporter mes données \(JSON\)/i })).toBeVisible();
  });

  test('télécharge un export JSON via le proxy BFF', async ({ page }) => {
    await loginDemoUser(page, '/profile');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Exporter mes données \(JSON\)/i }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^mdm-academy-export-\d{4}-\d{2}-\d{2}\.json$/);

    const path = await download.path();
    expect(path).toBeTruthy();

    const fileContents = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of fileContents!) {
      chunks.push(Buffer.from(chunk));
    }
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as typeof mockUserExportPayload;

    expect(parsed.profile.email).toBe(mockDemoUser.email);
    expect(parsed.progress?.points).toBe(120);

    await expect(page.getByRole('status').filter({ hasText: 'Export téléchargé' })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('refuse la suppression sans confirmation exacte', async ({ page }) => {
    await loginDemoUser(page, '/profile');

    await page.getByRole('button', { name: /Supprimer mon compte/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/Saisis SUPPRIMER/i).fill('supprimer');
    await page.getByRole('button', { name: /Confirmer la suppression/i }).click();

    await expect(page.getByRole('alert')).toContainText('Saisis exactement SUPPRIMER');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('exige le mot de passe pour supprimer un compte e-mail', async ({ page }) => {
    await loginDemoUser(page, '/profile');

    await page.getByRole('button', { name: /Supprimer mon compte/i }).click();
    await page.getByLabel(/Saisis SUPPRIMER/i).fill('SUPPRIMER');
    await page.getByRole('button', { name: /Confirmer la suppression/i }).click();

    await expect(page.getByRole('alert')).toContainText('Indique ton mot de passe actuel');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
