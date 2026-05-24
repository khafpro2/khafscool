import { expect, test } from '@playwright/test';
import { seedCookieConsent } from './helpers/cookie-consent';

test.describe('Module — section vidéo pilote', () => {
  test.beforeEach(async ({ page }) => {
    await seedCookieConsent(page);
  });

  test('affiche la section vidéo sur le module 1 Apple', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : comprendre l'ABM et l'enrôlement MDM/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.getByText(/Regardez la vidéo, puis lisez la leçon/i)).toBeVisible();
    await expect(videoSection.locator('iframe[title*="ABM"]')).toHaveCount(1);

    const sidebar = page.getByRole('navigation', { name: /Unités du parcours/i });
    await expect(sidebar.getByText(/Vidéo/)).toBeVisible();
  });
});
