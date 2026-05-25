import { expect, test } from '@playwright/test';
import { seedCookieConsent } from './helpers/cookie-consent';

test.describe('Module — section vidéo pilote', () => {
  test.beforeEach(async ({ page }) => {
    await seedCookieConsent(page);
  });

  test('n’affiche pas de section vidéo ADE sur le module 1 Apple', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-device-support-basics');
    await expect(
      page.getByRole('region', { name: /Vidéo : ABM, supervision et enrôlement automatisé/i })
    ).toHaveCount(0);
    await expect(page.locator('.module-video-section')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'Fondamentaux du support Apple', exact: true })
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test('affiche intro Jamf Pro sans vidéo Smart Groups sur le module 1 Jamf', async ({ page }) => {
    await page.goto('/courses/jamf-pro-foundations#module-smart-groups-policies');
    await expect(
      page.getByRole('region', { name: /Vidéo : Smart Groups et politiques Jamf Pro/i })
    ).toHaveCount(0);
    const introSection = page.getByRole('region', { name: /Vidéo : introduction Jamf Pro/i });
    await expect(introSection).toBeVisible({ timeout: 15_000 });
    await expect(introSection.locator('iframe[src*="t3j9TkFfUJw"]')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Smart Groups et politiques', exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('affiche la vidéo MP4 HeyGen française sur le module 1 Intune', async ({ page }) => {
    await page.goto('/courses/intune-ios-enrollment#module-ade-enrollment-basics');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : configurer l'ADE Intune avec ABM/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('.pill').filter({ hasText: 'Français' }).first()).toBeVisible();
    await expect(videoSection.locator('video source[src*="intune-ade-enrollment-basics-fr"]')).toHaveCount(1);
    await expect(videoSection.locator('iframe[src*="youtube"]')).toHaveCount(0);

    const sidebar = page.getByRole('navigation', { name: /Unités du parcours/i });
    await expect(sidebar.getByRole('button', { name: /Unité 1/i }).getByText(/Vidéo/)).toBeVisible();
  });
});
