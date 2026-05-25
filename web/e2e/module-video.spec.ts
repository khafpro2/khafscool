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
      page.getByRole('heading', { name: 'Fondamentaux Device Support', exact: true })
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

  test('affiche YouTube FR sur le module 4 Apple (apps VPP)', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-apps-vpp-management');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : apps VPP et apps gérées en entreprise/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('iframe[src*="k0cchC6mE88"]')).toHaveCount(1);
    await expect(videoSection.getByText(/Vidéo française bientôt disponible/i)).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'Gestion des apps et VPP', exact: true })
    ).toBeVisible({ timeout: 15_000 });
  });

  test('affiche YouTube FR sur le module 4 Jamf (API)', async ({ page }) => {
    await page.goto('/courses/jamf-pro-foundations#module-api-automation-advanced-policies');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : automatisation API Jamf Pro/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('iframe[src*="t3j9TkFfUJw"]')).toHaveCount(1);
    await expect(videoSection.getByText(/Vidéo française bientôt disponible/i)).toHaveCount(0);
  });

  test('affiche YouTube FR sur le module 3 Intune (App Protection)', async ({ page }) => {
    await page.goto('/courses/intune-ios-enrollment#module-app-protection-conditional-access');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : App Protection et Conditional Access Intune/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('iframe[src*="F4PESZiEQhU"]')).toHaveCount(1);
    await expect(videoSection.getByText(/Vidéo française bientôt disponible/i)).toHaveCount(0);
  });

  test('affiche YouTube FR sur le module 4 Intune (VPP ABM)', async ({ page }) => {
    await page.goto('/courses/intune-ios-enrollment#module-vpp-abm-business-apps');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : VPP, ABM et apps métier dans Intune/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('iframe[src*="k0cchC6mE88"]')).toHaveCount(1);
    await expect(videoSection.getByText(/Vidéo française bientôt disponible/i)).toHaveCount(0);
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

  test('affiche YouTube FR sur le module 2 Apple (dépannage iOS)', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-ios-troubleshooting');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : dépannage iOS en environnement géré/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('iframe[src*="lgMDK4zU114"]')).toHaveCount(1);
    await expect(videoSection.getByText(/Vidéo française bientôt disponible/i)).toHaveCount(0);
    await expect(videoSection.getByText(/ADE|ABM/i)).toHaveCount(0);
  });

  test('affiche MP4 FR sur le module 2 Jamf (inventaire)', async ({ page }) => {
    await page.goto('/courses/jamf-pro-foundations#module-inventory-basics');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : exporter un rapport inventaire Jamf Pro/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('.pill').filter({ hasText: 'Français' }).first()).toBeVisible();
    await expect(videoSection.locator('video source[src*="jamf-inventory-basics-fr"]')).toHaveCount(1);
    await expect(videoSection.locator('iframe[src*="youtube"]')).toHaveCount(0);
  });

  test('affiche MP4 FR sur le module 2 Intune (conformité)', async ({ page }) => {
    await page.goto('/courses/intune-ios-enrollment#module-compliance-policies');
    const videoSection = page.getByRole('region', {
      name: /Vidéo : notifications de conformité Intune/i,
    });
    await expect(videoSection).toBeVisible({ timeout: 15_000 });
    await expect(videoSection.locator('.pill').filter({ hasText: 'Français' }).first()).toBeVisible();
    await expect(videoSection.locator('video source[src*="intune-compliance-policies-fr"]')).toHaveCount(1);
    await expect(videoSection.locator('iframe[src*="youtube"]')).toHaveCount(0);
  });
});
