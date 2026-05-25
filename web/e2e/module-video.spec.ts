import { expect, test } from '@playwright/test';
import { seedCookieConsent } from './helpers/cookie-consent';

test.describe('Module — section vidéo pilote', () => {
  test.beforeEach(async ({ page }) => {
    await seedCookieConsent(page);
  });

  test('affiche le placeholder français sur le module 1 Apple (sans YouTube EN)', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-device-support-basics');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : ABM, supervision et enrôlement automatisé/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.getByText('Français')).toBeVisible();
    await expect(videoSection.getByText(/Vidéo française bientôt disponible/i)).toBeVisible();
    await expect(videoSection.locator('iframe[src*="youtube"]')).toHaveCount(0);
  });

  test('affiche la vidéo MP4 française sur le module 3 Apple', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-acmt-exam-prep');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : Apple Diagnostics et préparation examen/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.getByText('Français')).toBeVisible();
    await expect(videoSection.locator('video source[src*="apple-acmt-exam-prep-fr"]')).toHaveCount(1);
    await expect(videoSection.locator('iframe[src*="youtube"]')).toHaveCount(0);

    const sidebar = page.getByRole('navigation', { name: /Unités du parcours/i });
    await expect(sidebar.getByRole('button', { name: /Unité 3/i }).getByText(/Vidéo/)).toBeVisible();
  });
});
