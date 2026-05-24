import { expect, test } from '@playwright/test';
import { seedCookieConsent } from './helpers/cookie-consent';

test.describe('Module — section vidéo pilote', () => {
  test.beforeEach(async ({ page }) => {
    await seedCookieConsent(page);
  });

  test('n’affiche pas de section vidéo sur le module 1 Apple', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-device-support-basics');
    await expect(
      page.getByRole('region', { name: /Vidéo : comprendre l'ABM et l'enrôlement MDM/i })
    ).toHaveCount(0);
  });

  test('affiche la vidéo française sur le module 2 Apple', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-ios-troubleshooting');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : dépannage iOS en environnement géré/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('video')).toHaveCount(1);

    const sidebar = page.getByRole('navigation', { name: /Unités du parcours/i });
    await expect(sidebar.getByRole('button', { name: /Unité 2/i }).getByText(/Vidéo/)).toBeVisible();
  });
});
